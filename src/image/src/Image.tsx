import {
  defineComponent,
  h,
  inject,
  ref,
  PropType,
  toRef,
  mergeProps
} from 'vue'
import NImagePreview from './ImagePreview'
import type { ImagePreviewInst } from './ImagePreview'
import { imageGroupInjectionKey } from './ImageGroup'
import { ExtractPublicPropTypes } from '../../_utils'
import { useConfig } from '../../_mixins'

interface imgProps {
  alt?: string
  crossorigin?: 'anonymous' | 'use-credentials' | ''
  decoding?: 'async' | 'auto' | 'sync'
  height?: number
  sizes?: string
  src?: string
  srcset?: string
  usemap?: string
  width?: number
}

const imageProps = {
  alt: String,
  height: [String, Number] as PropType<string | number>,
  imgProps: Object as PropType<imgProps>,
  objectFit: {
    type: String as PropType<
    'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
    >,
    default: 'fill'
  },
  width: [String, Number] as PropType<string | number>,
  src: String,
  showToolbar: { type: Boolean, default: true },
  onError: Function as PropType<(e: Event) => void>
}

export type ImageProps = ExtractPublicPropTypes<typeof imageProps>

export default defineComponent({
  name: 'Image',
  props: imageProps,
  inheritAttrs: false,
  setup (props) {
    const imageRef = ref<HTMLImageElement | null>(null)
    const imgPropsRef = toRef(props, 'imgProps')
    const previewInstRef = ref<ImagePreviewInst | null>(null)
    const imageGroupHandle = inject(imageGroupInjectionKey, null)
    const { mergedClsPrefixRef } = imageGroupHandle || useConfig(props)
    return {
      mergedClsPrefix: mergedClsPrefixRef,
      groupId: imageGroupHandle?.groupId,
      previewInstRef,
      imageRef,
      imgProps: imgPropsRef,
      handleClick: () => {
        if (imageGroupHandle) {
          imageGroupHandle.setPreviewSrc(props.src)
          imageGroupHandle.setThumbnailEl(imageRef.value)
          imageGroupHandle.toggleShow()
          return
        }
        const { value: previewInst } = previewInstRef
        if (!previewInst) return
        previewInst.setPreviewSrc(props.src)
        previewInst.setThumbnailEl(imageRef.value)
        previewInst.toggleShow()
      }
    }
  },
  render () {
    const { mergedClsPrefix, imgProps = {} } = this

    const imgWrapperNode = h(
      'div',
      mergeProps(this.$attrs, {
        role: 'none',
        class: `${mergedClsPrefix}-image`
      }),
      <img
        {...imgProps}
        class={this.groupId}
        ref="imageRef"
        width={this.width ? this.width : imgProps.width}
        height={this.height ? this.height : imgProps.height}
        src={this.src ? this.src : imgProps.src}
        alt={this.alt ? this.alt : imgProps.alt}
        aria-label={this.alt ? this.alt : imgProps.alt}
        onClick={this.handleClick}
        onError={this.onError}
        style={{ objectFit: this.objectFit }}
      />
    )

    return this.groupId ? (
      imgWrapperNode
    ) : (
      <NImagePreview
        clsPrefix={mergedClsPrefix}
        ref="previewInstRef"
        showToolbar={this.showToolbar}
      >
        {{
          default: () => imgWrapperNode
        }}
      </NImagePreview>
    )
  }
})
