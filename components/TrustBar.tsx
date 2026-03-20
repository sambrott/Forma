const CHECK = (
  <svg viewBox="0 0 8 8"><polyline points="1,4 3.5,6.5 7,1.5"/></svg>
)

const items = ['Files deleted immediately', 'Zero data collection', 'No account, ever']

export default function TrustBar() {
  return (
    <div className="trust-bar">
      {items.map(text => (
        <div key={text} className="trust-item">
          <div className="trust-check-col">
            <div className="trust-check">{CHECK}</div>
          </div>
          <div className="trust-text">{text}</div>
        </div>
      ))}
    </div>
  )
}
