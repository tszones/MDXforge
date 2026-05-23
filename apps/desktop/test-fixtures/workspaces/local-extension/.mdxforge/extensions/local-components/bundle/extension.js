export default function defineLocalComponents(runtime) {
  const { jsx } = runtime

  function LocalBadge({ label }) {
    return jsx('span', {
      className: 'local-badge',
      children: label
    })
  }

  return {
    components: {
      LocalBadge
    }
  }
}
