import { Router } from 'express'
import apiController from '../controller/cosmos-api-controller'

const router:Router = Router()



router.route('/backendhealth').get(apiController.health)
router.route('/registerUser').post(apiController.registerUser)
router.route('/buyPlanetCosmos').post(apiController.buyCosmosPlanet)


export default router 