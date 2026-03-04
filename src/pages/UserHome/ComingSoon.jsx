import useTitle from '../../utils/useTitle';
import speedler from '../../assets/speedler.jpeg';
import './Placeholder.css';

export default function ComingSoon() {
  useTitle('Coming Soon');
  return (
    <div className="placeholder-container">
      <div className="placeholder-content">
        <img 
          src={speedler} 
          alt="Coming Soon" 
          className="placeholder-image rounded"
        />
        <h1>Coming Soon!</h1>
        <p>Our engineers are working hard to bring this feature to life. Stay tuned!</p>
      </div>
    </div>
  );
}
