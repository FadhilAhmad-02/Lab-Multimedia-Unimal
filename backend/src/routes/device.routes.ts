import {
    Router,
} from "express";

import {
    getDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    getDeviceStats,
} from "../controllers/device.controller";

const router =
    Router();

/*
=================================
GET ALL DEVICES
=================================
*/
router.get(
    "/",
    getDevices
);

/*
=================================
GET STATS
=================================
*/
router.get(
    "/stats",
    getDeviceStats
);

/*
=================================
CREATE DEVICE
=================================
*/
router.post(
    "/",
    createDevice
);

/*
=================================
UPDATE DEVICE
=================================
*/
router.put(
    "/:id",
    updateDevice
);

/*
=================================
DELETE DEVICE
=================================
*/
router.delete(
    "/:id",
    deleteDevice
);

export default router;