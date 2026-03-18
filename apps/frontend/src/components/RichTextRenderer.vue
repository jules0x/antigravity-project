<script lang="ts">
import { defineComponent, h } from 'vue'
import type { PropType, VNode } from 'vue'

const IS_BOLD = 1
const IS_ITALIC = 1 << 1
const IS_STRIKETHROUGH = 1 << 2
const IS_UNDERLINE = 1 << 3
const IS_CODE = 1 << 4
const IS_SUBSCRIPT = 1 << 5
const IS_SUPERSCRIPT = 1 << 6

export default defineComponent({
  name: 'RichTextRenderer',
  props: {
    content: {
      type: [Object, Array] as PropType<any>,
      required: true
    }
  },
  render() {
    const renderNode = (node: any, index: number): VNode | string | null => {
      if (!node) return null

      if (Array.isArray(node)) {
        return h('div', { class: 'rich-text-group', key: index }, node.map((n, i) => renderNode(n, i)))
      }

      // Root node handling
      if (node.type === 'root') {
        const children = node.children || []
        return h('div', { class: 'rich-text-root', key: 'root' }, children.map((n: any, i: number) => renderNode(n, i)))
      }

      // Process children recursively
      const children = node.children ? node.children.map((n: any, i: number) => renderNode(n, i)) : []

      // Node mapping
      switch (node.type) {
        case 'paragraph':
          return h('p', { key: index }, children)
        case 'heading':
          return h(node.tag || 'h1', { key: index }, children)
        case 'list':
          const tag = node.tag || (node.listType === 'number' ? 'ol' : 'ul')
          return h(tag, { key: index }, children)
        case 'listitem':
          return h('li', { key: index, value: node.value }, children)
        case 'quote':
          return h('blockquote', { key: index }, children)
        case 'link':
          const href = node.fields?.url || node.url
          return h('a', { key: index, href, target: node.fields?.newTab ? '_blank' : undefined }, children)
        case 'text':
          let textElement: any = node.text
          if (node.format) {
            if (node.format & IS_BOLD) textElement = h('strong', {}, [textElement])
            if (node.format & IS_ITALIC) textElement = h('em', {}, [textElement])
            if (node.format & IS_STRIKETHROUGH) textElement = h('s', {}, [textElement])
            if (node.format & IS_UNDERLINE) textElement = h('u', {}, [textElement])
            if (node.format & IS_CODE) textElement = h('code', {}, [textElement])
            if (node.format & IS_SUBSCRIPT) textElement = h('sub', {}, [textElement])
            if (node.format & IS_SUPERSCRIPT) textElement = h('sup', {}, [textElement])
          }
          return typeof textElement === 'string' ? textElement : h('span', { key: index }, [textElement])
        case 'linebreak':
          return h('br', { key: index })
        default:
          return h('div', { key: index, class: 'unknown-node', 'data-type': node.type }, children)
      }
    }

    return renderNode(this.content, 0) as VNode
  }
})
</script>

<style scoped lang="scss">
.rich-text-root {
  p {
    margin-bottom: 1em;
    line-height: 1.6;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.2;
    font-weight: 600;
  }
  
  ul, ol {
    margin-bottom: 1em;
    padding-left: 2em;
    
    li {
      margin-bottom: 0.2em;
    }
  }
  
  a {
    color: var(--color-primary, #007bff);
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
    }
  }
  
  blockquote {
    border-left: 4px solid var(--border-color, #ccc);
    margin: 1.5em 0;
    padding-left: 1em;
    color: var(--text-muted, #666);
    font-style: italic;
  }
  
  code {
    background: var(--bg-secondary, #f4f4f4);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }
}
</style>
