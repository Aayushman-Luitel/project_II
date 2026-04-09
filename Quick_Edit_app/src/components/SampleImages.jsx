const samples = [
  'https://picsum.photos/id/1015/400/300',  // landscape
  'https://picsum.photos/id/104/400/300',   // dog
  'https://picsum.photos/id/169/400/300',   // sunset
  'https://picsum.photos/id/155/400/300',   // water
];

export default function SampleImages({ onSelect }) {
  return (
    <div className="sample-grid">
      {samples.map((url, idx) => (
        <img key={idx} src={url} alt={`sample ${idx}`} onClick={() => onSelect(url)} />
      ))}
    </div>
  );
}