import secureIcon from './icons/secure_icon.svg';

export default function Browser() {
  return (
    <div className="browser">
      <div className="top-bar">
        <div className="address-bar">
          <img className="secure-icon" src={secureIcon} alt="secure icon" />
          pump.fun
        </div>
      </div>
    </div>
  );
}
