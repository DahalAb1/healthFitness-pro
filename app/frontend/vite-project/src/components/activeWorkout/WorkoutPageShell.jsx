import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

function WorkoutPageShell({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default WorkoutPageShell;
