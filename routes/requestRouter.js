const router = require('express').Router()
const {Authentication} = require ('../middlewares/auth')
const { createRequest, acceptRequest, rejectRequest, allRequestForAdmin } = require('../controller/requestController');

router.post('/request/:groupId',Authentication, createRequest)
router.post('/request-accept/:requestId',Authentication, acceptRequest)
router.put('/request-decline/:requestId',Authentication, rejectRequest)
router.put('/request-all/:grouoId',Authentication, allRequestForAdmin)

module.exports = router