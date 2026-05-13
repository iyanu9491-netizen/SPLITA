const router = require('express').Router()
const {Authentication} = require ('../middlewares/auth')
const {groupValidator} = require ('../middlewares/validator')
const { createGroup, getAllgroup, getOneGroup, removeMemberFromGroup } = require('../controller/groupController');

router.post('/group', Authentication,groupValidator, createGroup)
router.get('/group',Authentication,getAllgroup)
router.get('/oneGroup/:id',Authentication, getOneGroup)

router.patch('/:groupId/:memberId',Authentication, removeMemberFromGroup )

module.exports = router