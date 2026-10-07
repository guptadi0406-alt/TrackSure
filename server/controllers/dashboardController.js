import Parcel from "../models/Parcel.js";
import ParcelRisk from "../models/ParcelRisk.js";
import Alert from "../models/Alert.js";
import Facility from "../models/Facility.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";



export const getDashboardOverview = async (req, res) => {
  try {
    const [
      totalParcels,
      inTransit,
      delivered,
      atRisk,
      critical,
      delayed,
      lost,
      recovered,
      openAlerts,
      activeInvestigations
    ] = await Promise.all([
      Parcel.countDocuments(),

      Parcel.countDocuments({
        status: "IN_TRANSIT"
      }),

      Parcel.countDocuments({
        status: "DELIVERED"
      }),

      Parcel.countDocuments({
        status: "AT_RISK"
      }),

      Parcel.countDocuments({
        status: "CRITICAL"
      }),

      Parcel.countDocuments({
        status: "DELAYED"
      }),

      Parcel.countDocuments({
        status: "LOST"
      }),

      Parcel.countDocuments({
        status: "RECOVERED"
      }),

      Alert.countDocuments({
        status: {
          $in: ["OPEN", "ACKNOWLEDGED", "INVESTIGATING"]
        }
      }),

      Parcel.countDocuments({
        status: {
          $in: ["AT_RISK", "CRITICAL", "LOST"]
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        parcels: {
          total: totalParcels,
          inTransit,
          delivered,
          delayed,
          atRisk,
          critical,
          lost,
          recovered
        },

        alerts: {
          open: openAlerts
        },

        investigations: {
          active: activeInvestigations
        }
      }
    });

  } catch (error) {
    console.error("Dashboard overview error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error.message
    });
  }
};




export const getRiskDistribution = async (req, res) => {
  try {
    const distribution = await Parcel.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1
          }
        }
      }
    ]);

    const result = {
      NORMAL: 0,
      WATCH: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };

    for (const item of distribution) {
      if (item._id === "IN_TRANSIT") {
        result.NORMAL += item.count;
      }

      if (item._id === "AT_RISK") {
        result.HIGH += item.count;
      }

      if (item._id === "CRITICAL") {
        result.CRITICAL += item.count;
      }
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Risk distribution error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch risk distribution",
      error: error.message
    });
  }
};




export const getRecentAlerts = async (req, res) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 10,
      50
    );

    const alerts = await Alert.find()
      .populate(
        "parcelId",
        "trackingNumber status currentState currentFacilityId"
      )
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    console.error("Recent alerts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent alerts",
      error: error.message
    });
  }
};


export const getFacilityAnomalies = async (req, res) => {
  try {
    const facilities = await Facility.find({
      isActive: true
    }).lean();

    const results = [];

    for (const facility of facilities) {
      const parcelIds = await Parcel.find({
        currentFacilityId: facility._id
      }).distinct("_id");

      const alerts = await Alert.countDocuments({
        parcelId: {
          $in: parcelIds
        },
        type: "FACILITY_ANOMALY",
        status: {
          $nin: ["RESOLVED", "DISMISSED"]
        }
      });

      const highRiskParcels = await Parcel.countDocuments({
        currentFacilityId: facility._id,
        status: {
          $in: ["AT_RISK", "CRITICAL"]
        }
      });

      results.push({
        facilityId: facility._id,
        code: facility.code,
        name: facility.name,
        city: facility.city,
        anomalyAlerts: alerts,
        highRiskParcels
      });
    }

    results.sort(
      (a, b) =>
        (b.anomalyAlerts + b.highRiskParcels) -
        (a.anomalyAlerts + a.highRiskParcels)
    );

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error("Facility anomalies error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility anomalies",
      error: error.message
    });
  }
};




export const getRoutePerformance = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate(
        "originId",
        "code name"
      )
      .populate(
        "destinationId",
        "code name"
      )
      .lean();

    const result = [];

    for (const route of routes) {
      const parcels = await Parcel.find({
        routeId: route._id
      }).lean();

      const total = parcels.length;

      const delivered = parcels.filter(
        p => p.status === "DELIVERED"
      ).length;

      const atRisk = parcels.filter(
        p =>
          p.status === "AT_RISK" ||
          p.status === "CRITICAL"
      ).length;

      const delayed = parcels.filter(
        p => p.status === "DELAYED"
      ).length;

      const deliveryRate =
        total > 0
          ? Number(((delivered / total) * 100).toFixed(2))
          : 0;

      result.push({
        routeId: route._id,
        routeCode: route.routeCode,
        name: route.name,

        origin: route.originId,
        destination: route.destinationId,

        totalParcels: total,
        delivered,
        atRisk,
        delayed,
        deliveryRate
      });
    }

    res.json({
      success: true,
      count: result.length,
      data: result
    });

  } catch (error) {
    console.error("Route performance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route performance",
      error: error.message
    });
  }
};



export const getRiskTrend = async (req, res) => {
  try {
    const days = Math.min(
      Number(req.query.days) || 7,
      30
    );

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - days
    );

    const trend = await ParcelRisk.aggregate([
      {
        $match: {
          calculatedAt: {
            $gte: startDate
          }
        }
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$calculatedAt"
            },

            month: {
              $month: "$calculatedAt"
            },

            day: {
              $dayOfMonth: "$calculatedAt"
            }
          },

          averageScore: {
            $avg: "$score"
          },

          maximumScore: {
            $max: "$score"
          },

          calculations: {
            $sum: 1
          }
        }
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1
        }
      }
    ]);

    const result = trend.map(item => ({
      date: `${item._id.year}-${String(
        item._id.month
      ).padStart(2, "0")}-${String(
        item._id.day
      ).padStart(2, "0")}`,

      averageScore: Number(
        item.averageScore.toFixed(2)
      ),

      maximumScore: item.maximumScore,

      calculations: item.calculations
    }));

    res.json({
      success: true,
      days,
      data: result
    });

  } catch (error) {
    console.error("Risk trend error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch risk trend",
      error: error.message
    });
  }
};