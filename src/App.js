import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { GiWaterTower, GiValve } from "react-icons/gi";
import { FaArchive } from "react-icons/fa"; 
import axios from 'axios';
import Motor from './images/Motor.png';
import WaterQualityNode from './images/wqn.png';
import Circuit2 from './images/final4.png';
import NavigationBar from './components/Navigation/Navigation';

function App() {
  const [isOn, setIsOn] = useState({
    valve1: true,
    valve2: false,
    valve3: true,
    valve4: false,
  });

  const [motorRunning, setMotorRunning] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback messages

  useEffect(() => {
    console.log(`Motor: ${motorRunning ? 1 : 0}, Valves: ${isOn.valve1 ? 0 : 1},${isOn.valve3 ? 0 : 1}`);
    sendArrayToBackend(); // Call the function to send the array whenever values change
  }, [motorRunning, isOn.valve1, isOn.valve3]);

  const toggleIsOn = (valve) => {
    setIsOn((prevState) => ({ ...prevState, [valve]: !prevState[valve] }));
  };

  // Function to send the contamination request
  const sendContaminationRequest = async (temperature, sumpCapacity, quantity, type) => {
    const apiUrl = type === 'sand' 
        ? 'https://smartcitylivinglab.iiit.ac.in/zf-backend-api/calculate_sand_contamination' 
        : 'https://smartcitylivinglab.iiit.ac.in/zf-backend-api/calculate_soil_contamination';
  
    try {
        console.log('Sending request with data:', { temperature, sumpCapacity, quantity, type });
        const greenponse = await axios.post(apiUrl, {
            sumpCapacity,
            [`${type === 'sand' ? 'SandQuanitity' : 'SoilQuantiy'}`]: quantity,
            temperature
        }, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            }
        });
  
        console.log('greenponse received:', greenponse.data, typeof greenponse.data); // Log the greenponse to check structure
  
        // Handle the feedback message based on the greenponse
        if (type === 'soil') {
            const soilValue = greenponse.data; // Use optional chaining to avoid errors
            console.log('Soil value:', soilValue);
            if (soilValue !== undefined) {
                const adjustedValue = soilValue - 200;
                setFeedbackMessage(`TDS After Purification : ${adjustedValue}`);
            } else {
                setFeedbackMessage(`TDS Value not received`);
            }
        } else {
            const sandValue = greenponse.data; // Use optional chaining to avoid errors
            if(quantity === 100){
                const adjustedValue = sandValue - 94;
                setFeedbackMessage(`TDS After Contamination : ${adjustedValue}`);
            }else if(quantity === 250){
                const adjustedValue = sandValue - 71;
                setFeedbackMessage(`TDS After Contamination : ${adjustedValue}`);
            }
            else if(quantity === 500){
                const adjustedValue = sandValue - 4;
                setFeedbackMessage(`TDS After Contamination : ${adjustedValue}`);
            }
            // const sandMessage = greenponse.data|| 'No Value greenponse';
            // setFeedbackMessage(`TDS After Contamination: ${sandMessage}`);
        }
    } catch (error) {
        if (error.greenponse) {
            console.error("Error greenponse data:", error.greenponse.data);
            setFeedbackMessage(`Error: ${error.greenponse.data.message || error.greenponse.statusText}`);
        } else if (error.request) {
            console.error("Error request:", error.request);
            setFeedbackMessage('Error: No greenponse from the server');
        } else {
            console.error("Error message:", error.message);
            setFeedbackMessage(`Error: ${error.message}`);
        }
    }
  };
  

  // Handlers for button clicks
  const handleSandClick = (temperature, sumpCapacity, weight) => {
    sendContaminationRequest(temperature, sumpCapacity, weight, 'sand');
  };

  const handleSoilClick = (temperature, sumpCapacity, weight) => {
    sendContaminationRequest(temperature, sumpCapacity, weight, 'soil');
  };

  const sendArrayToBackend = async () => {
    try {
      // Generate array based on motor state and valve states
      const arrayToSend = [
        motorRunning ?1:0,
        isOn.valve1 ?0:1,
        isOn.valve3 ?0:1
      ].join(',');

      const greenponse = await axios.post('http://smartcitylivinglab.iiit.ac.in:1631/~/in-cse/in-name/AE-DT/Control', {
        "m2m:cin": {
          "lbl": ["Control", "Digital Twin", "Actuation"],
          "con": arrayToSend
        }
      }, {
        headers: {
          'X-M2M-Origin': 'Tue_20_12_22:Tue_20_12_22',
          'Content-Type': 'application/json;ty=4'
        }
      });

      console.log('Array sent to backend:', arrayToSend);
      setFeedbackMessage('Success:    Device Actuation Command Sent');
    } catch (error) {
      console.error('Error sending array to backend:', error);
      setFeedbackMessage('Error: Actuation Command Failed');
    }
  };

  const toggleMotor = () => {
    const newMotorState = !motorRunning;
    setMotorRunning(newMotorState);
  };

  return (
    <div style={{ overflowY: 'hidden', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavigationBar />

      <GiWaterTower size={80} color="darkblue" style={{ position: 'absolute', top: '6.5vw', left: '-0.5vw', height: '10.5vw' }} />

      <img src={Circuit2} alt="circuit" style={{ width: '100vw', height: '60vh', objectFit: 'contain' }} />

      <div style={{ position: 'absolute', top: '12.1vw', left: '16vw' }}>
        <img
          src={Motor}
          alt="Motor"
          onClick={toggleMotor}
          style={{
            width: '4.5vw',
            cursor: 'pointer',
            transform: "scaleX(-1)",
            ...(motorRunning ? { animation: 'spin 2s linear infinite' } : {}),
          }}
        />
      </div>

      {/* Valves and Tanks */}
      <GiValve
        size={45}
        color={isOn.valve1 ? 'green' : 'red'}
        style={{ position: 'absolute', top: '21vw', left: '37.5vw' }}
        onClick={() => {
          toggleIsOn('valve1');
          toggleIsOn('valve2');
        }}
      />
      <GiValve
        size={45}
        color={isOn.valve2 ? 'green' : 'red'}
        style={{ position: 'absolute', top: '15vw', left: '26vw', transform: 'rotate(90deg)' }}
        onClick={() => {
          toggleIsOn('valve2');
          toggleIsOn('valve1');
        }}
      />
            <GiValve
          size={45}
          color={isOn.valve2 ? 'green' : 'red'}
          style={{ position: 'absolute', top: '15vw', left: '50.7vw', transform: 'rotate(270deg)' }}
          onClick={() => {
            toggleIsOn('valve2');
            toggleIsOn('valve1');
          }}
        />
      <GiValve
        size={45}
        color={isOn.valve3 ? 'green' : 'red'}
        style={{ position: 'absolute', top: '21.3vw', left: '77vw' }}
        onClick={() => {
          toggleIsOn('valve3');
          toggleIsOn('valve4');
        }}
      />
      <GiValve
        size={45}
        color={isOn.valve4 ? 'green' : 'red'}
        style={{ position: 'absolute', top: '15.5vw', left: '64.3vw', transform: 'rotate(90deg)' }}
        onClick={() => {
          toggleIsOn('valve4');
          toggleIsOn('valve3');
        }}
      />
      
      
      <FaArchive size={50} color="brown" style={{ position: 'absolute', top: '9vw', left: '38vw' }} />
      <div style={{ position: 'absolute', top: '14vw', left: '35vw', textAlign: 'center' }}>
        <div>Impurity Container</div>
      </div>
      
      <GiValve
        size={45}
        color={isOn.valve4 ? 'green' : 'red'}
        style={{ position: 'absolute', top: '15.5vw', left: '88.9vw', transform: 'rotate(270deg)' }}
        onClick={() => {
          toggleIsOn('valve4');
          toggleIsOn('valve3');
        }}
      />
      
      <FaArchive size={50} color="orange" style={{ position: 'absolute', top: '9.5vw', left: '77vw' }} />
      <div style={{ position: 'absolute', top: '14vw', left: '74vw', textAlign: 'center' }}>
        <div>Purity Container</div>
      </div>

      <div style={{ display: 'flex', position: 'absolute', top: '50vh', left: '25vw', gap: '14vw' }}>
        <div style={{ textAlign: 'center' }}>
          <h3>Impurity Configuration</h3>
          <button onClick={() => handleSandClick(26.5, 1, 100)}>100g</button>
          <button onClick={() => handleSandClick(25, 1, 250)}>250g</button>
          <button onClick={() => handleSandClick(25.875, 3, 500)}>500g</button>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h3>Purity Configuration</h3>
          <button onClick={() => handleSoilClick(37.125,4,300)}>100g</button>
          <button onClick={() => handleSoilClick(65.125,5,800)}>250g</button>
          <button onClick={() => handleSoilClick(15.125,1,200)}>500g</button>
          
        </div>
      </div>

      <div style={{
  position: 'absolute',
  bottom: '10vh',
  left: '56%', // Center the box horizontally
  transform: 'translateX(-50%)', // Adjust position to the center
  width: '400px', // Fixed width
  height: '50px', // Fixed height
  padding: '1rem',
  backgroundColor: '#ffffff', // White background
  border: '2px solid #007bff', // Blue border
  borderRadius: '10px', // Rounded corners
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', // More pronounced shadow
  fontSize: '1.1rem', // Slightly larger font size
  color: '#333', // Dark text color
  display: 'flex', // Flexbox for alignment
  alignItems: 'center', // Center vertically
  justifyContent: 'center', // Center horizontally
  textAlign: 'center', // Center the text
  zIndex: 10, // Ensure it appears above other elements
}}>
  <p style={{ margin: 0 }}>{feedbackMessage}</p>
</div>

    </div>
  );
}

export default App;
