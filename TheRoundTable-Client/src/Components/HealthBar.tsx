export const HealthBar = ({ currentHealth, maxHealth }:{ currentHealth:number, maxHealth:number }) => {
  const percentage = (currentHealth / maxHealth) * 100;
  const barStyle = {
    width: '287px',
    height: '20px',
    backgroundColor: '#e03131', // Dark red for the underlying health bar
    position: 'relative',
    borderRadius: '500px'
  };
  const fillStyle = {
    width: `${percentage}%`,
    height: '100%',
    backgroundColor: '#ff8787', // Vibrant red for the current health
    position: 'absolute',
    top: '0',
    left: '0',
    borderRadius: '500px'
  };
  
  return (
    <div className="flex flex-row items-center">
      <div style={barStyle}>
        <div style={fillStyle}></div>
      </div>
      <span className="pl-3">{currentHealth}</span>
      <span className="">/</span>
      <span>{maxHealth}</span>
    </div>
  );
};