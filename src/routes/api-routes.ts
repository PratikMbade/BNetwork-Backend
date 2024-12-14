import { Router } from 'express'
import universeApiController from '../controller/universe-api-controller'
import cosmosApiController from '../controller/cosmos-api-controller'

const router:Router = Router()



router.route('/backendhealth').get(cosmosApiController.health)
router.route('/registerUser').post(cosmosApiController.registerUser)
router.route('/buyPlanetCosmos').post(cosmosApiController.buyCosmosPlanet)
router.route('/buyPlanetUniverse').post(universeApiController.buyPlanetUniverseController)


export default router 