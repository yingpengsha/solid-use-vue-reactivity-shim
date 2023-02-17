import { ReactiveEffect } from '@vue/reactivity'
import { enableExternalSource } from 'solid-js'

enableExternalSource((getter, trigger) => {
  let result: any

  const reactiveEffect = new ReactiveEffect(() => {
    result = getter(result)
  }, () => trigger())

  return {
    track: (preValue) => {
      result = preValue
      reactiveEffect.run()
      return result
    },
    dispose: () => {
      reactiveEffect.stop()
    }
  }
})
