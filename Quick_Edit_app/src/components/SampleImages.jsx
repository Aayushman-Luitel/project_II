const samples = [
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400', // landscape
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', // dog
  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400', // girl portrait
  'https://images.pexels.com/photos/257540/pexels-photo-257540.jpeg?auto=compress&cs=tinysrgb&w=400', // cat
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