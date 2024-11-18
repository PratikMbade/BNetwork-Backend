import { Router } from 'express'
import apiController from '../controller/api-controller'

const router:Router = Router()


router.route('/self').get(apiController.self)
router.route('/backendhealth').get(apiController.health)
export default router 