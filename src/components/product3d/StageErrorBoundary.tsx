import {Component,type ErrorInfo,type ReactNode} from 'react'

type Props={fallback:ReactNode;children:ReactNode}
type State={failed:boolean}

/** Isolates a single card stage crash so the catalog stays mounted. */
export class StageErrorBoundary extends Component<Props,State>{
  state:State={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(error:Error,_info:ErrorInfo){
    console.warn('[ProductStage]',error.message)
  }
  render(){
    if(this.state.failed)return this.props.fallback
    return this.props.children
  }
}
