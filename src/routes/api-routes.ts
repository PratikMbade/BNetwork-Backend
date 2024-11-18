import { Router } from 'express'
import apiController from '../controller/api-controller'

const router:Router = Router()



router.route('/backendhealth').get(apiController.health)
router.route('/registerUser').post(apiController.registerUser)

export default router 