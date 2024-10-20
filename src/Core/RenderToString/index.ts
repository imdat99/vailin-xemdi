import init from "./init"
import { attrsModule, classModule, datasetModule, propsModule, styleModule } from "./modules"

export const RenderToString = init([
  styleModule,
  propsModule,
  datasetModule,
  classModule,
  attrsModule
])

export default RenderToString