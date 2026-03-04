import useTitle from '../../utils/useTitle';
import './Placeholder.css';

export default function DashboardHome() {
  useTitle('Dashboard Home');
  return (
    <div className="placeholder-container">
      <div className="placeholder-content">
        <img 
          src="https://illustrations.popsy.co/white/product-launch.svg" 
          alt="Welcome" 
          className="placeholder-image"
        />
        <h1>Welcome to your Dashboard</h1>
        <p>Select a diagram type from the sidebar to start generating your intelligent visualizations.</p>
      </div>
    </div>
  );
}
