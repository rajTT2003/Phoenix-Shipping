import { Circles } from "react-loader-spinner";

const Loader = ({ size, color}) => {
  return (
    <div className="flex justify-center items-center">
      <Circles
        visible={true}
        height={size}
        width={size}
        color={color}
        ariaLabel="three-circles-loading"
      />
    </div>
  );
};

export default Loader;
