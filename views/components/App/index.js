import React, { useContext, useState, useEffect } from 'react';
import './style.scss';
import ListOfMonths from '../ListOfMonths';
import GoogleLogin from '../GoogleLogin';
// import Alert from '../Alert';
import logo from '../../assets/logo-calendar.png';
import Loader from '../Loader';
import config from '../Config';
import DayModal from '../DayModal';
import AppHeader from '../AppHeader';
import AppContext from '../../context';

const App = () => {
  const actualTCgId = localStorage.getItem('TCgId');
  const [isFetching, setIsFetching] = useState(false);
  const [isLogin, setIsLogin] = useState(false); // Local Sotorage TCgId exist
  const [TCgId, setTCgId] = useState(actualTCgId);
  const [showDay, setShowDay] = useState(false);
  const [targetDay, setTargetDay] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [targetDayTId, setTargetDayTId] = useState(null);
  const [showDayLoader, setShowDayLoader] = useState(false);
  const [dayObject, setDayObject] = useState(null);
  const [givenName, setGivenName] = useState(null);
  const [gId, setgId] = useState(null);
  const [gImg, setgImg] = useState(null);

  const refreshNow = () => {
    setRefresh(true);
    setRefresh(false);
  };

  const showAlert = () => {
    $('#workoutDay').modal('hide');
    $('#alert').modal('show');

    setTimeout(() => {
      $('#alert').modal('hide');
    }, 2000);
  };

  const isDay = (day, trainingId) => {
    if (actualTCgId !== null) {
      // const targetDateChanged = day.replace(/\./g, '');

      fetch(`${config.domain}/trainings/user/${TCgId}/id/${trainingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          key: config.secretKey,
          userid: TCgId,
        },
      })
        .then(response => response.json())
        .then(response => {
          setDayObject({
            targetColorTag: response.colorTag,
            colorTag: response.colorTag,
            description: response.description,
            distance: response.distance,
            calories: response.calories,
            time: response.time,
            type: response.type,
          });
          setShowDay(true);
          setTargetDay(day);
          setTargetDayTId(trainingId);
          setShowDayLoader(false);
          // setIsDescriptionInactive(false);
        })
        .catch(() => {
          setDayObject({
            colorTag: null,
            description: null,
            distance: null,
            calories: null,
            time: null,
            type: null,
          });
          setShowDay(false);
          setTargetDay(null);
          setTargetDayTId(null);
          // setIsDescriptionInactive(true);
        });
    }
  };

  // Show the day editing panel
  const showDayNow = e => {
    setShowDayLoader(true);
    setShowDay(true);

    if (e.target.attributes.getNamedItem('id') !== null) {
      if (e.target.attributes.getNamedItem('trainingId')) {
        isDay(
          e.target.attributes.getNamedItem('id').value,
          e.target.attributes.getNamedItem('trainingId').value,
        );
      } else {
        setShowDayLoader(false);
        const dayObjectReset = {
          colorTag: null,
          description: null,
          distance: null,
          calories: null,
          time: null,
        };
        setDayObject(dayObjectReset);
        setShowDay(true);
        setTargetDay(e.target.attributes.getNamedItem('id').value);
        // setIsDescriptionInactive(false);
      }
    }
  };

  // Save to db and close the day editing panel
  const saveDay = () => {
    if (localStorage.getItem('TCgId') !== null) {
      const googleId = localStorage.getItem('TCgId');
      const targetDateChanged = targetDay.replace(/\./g, '');
      const descriptionValue = document.getElementById('description').value;
      const distanceValue = document.getElementById('distance').value;
      const caloriesValue = document.getElementById('calories').value;
      const timeValue = document.getElementById('time').value;
      const typeValue = document.getElementById('type').value;
      // const { targetColorTag } = this.props;

      const data = {
        trainingDate: targetDateChanged,
        colorTag: null,
        description: `${descriptionValue} `,
        distance: distanceValue,
        calories: caloriesValue,
        time: timeValue,
        userId: googleId,
        type: typeValue === '-' ? null : typeValue,
      };

      fetch(`${config.domain}/trainings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          key: config.secretKey,
          userid: TCgId,
        },
        body: JSON.stringify(data),
      })
        .then(response => response.json())
        .then(() => {
          // this.setState({ showDay: false });
          refreshNow();
          showAlert('Workout added!');
        });
    }
  };

  const updateDay = () => {
    if (actualTCgId !== null) {
      const descriptionValue = document.getElementById('description').value;
      const distanceValue = document.getElementById('distance').value;
      const caloriesValue = document.getElementById('calories').value;
      const timeValue = document.getElementById('time').value;
      const typeValue = document.getElementById('type').value;
      // const { targetColorTag } = this.props;

      const data = {
        colorTag: null,
        description: descriptionValue,
        distance: distanceValue === '' ? 0 : distanceValue,
        calories: caloriesValue === '' ? 0 : caloriesValue,
        time: timeValue === '' ? 0 : timeValue,
        type: typeValue === '-' ? null : typeValue,
      };

      fetch(`${config.domain}/trainings/user/${TCgId}/id/${targetDayTId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          key: config.secretKey,
          userid: TCgId,
        },
        body: JSON.stringify(data),
      }).then(() => {
        // this.setState({ showDay: false });
        refreshNow();
        showAlert('Workout updated!');
      });
    }
  };

  const deleteDay = () => {
    // TODO: Add alert to confirm deleting...
    fetch(`${config.domain}/trainings/user/${actualTCgId}/id/${targetDayTId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        key: config.secretKey,
        userid: actualTCgId,
      },
    }).then(() => {
      // this.setState({ showDay: false });
      refreshNow();
      showAlert('Workout deleted!');
    });
  };

  const closeDay = () => {
    setShowDay(false);
  };

  const google = data => {
    if (data) {
      setTCgId(actualTCgId);
      setIsLogin(true);
      setIsFetching(false);
      setGivenName(data.givenName);
      setgId(data.gId);
      setgImg(data.gImg);
    }
  };

  const contextElements = {
    showAlert,
    saveDay,
    deleteDay,
    updateDay,
  };

  useEffect(() => {
    // if (userContext.givenName !== null) {
    //   google(userContext);
    // }
    // console.log(userContext);
    if (actualTCgId !== null) {
      setTCgId(actualTCgId);
      setIsLogin(true);
      setIsFetching(false);
    } else {
      setIsFetching(false);
    }
  });

  return (
    <div className="App">
      <AppContext.Provider value={contextElements}>
        {isFetching && (
          <div>
            <Loader />
          </div>
        )}

        {TCgId === null && !isFetching && (
          <header className="App-header">
            <div className="welcome-container">
              <img className="logo-welcome-page" src={logo} alt="logo" />
              <p>FitCalendar</p>
              <div>
                <GoogleLogin google={google} />
                <div className="footer">FitCalendar</div>
              </div>
            </div>
          </header>
        )}

        {TCgId !== null && !isFetching && (
          <div>
            <div>{!refresh && <AppHeader name={givenName} id={gId} img={gImg} />}</div>

            <div
              role="button"
              styling="link"
              tabIndex={0}
              onClick={showDayNow}
              onKeyDown={showDayNow}
            >
              {!refresh && <ListOfMonths TCgId={TCgId} />}
            </div>

            {/* <DayModal
              showDay={showDay}
              targetDay={targetDay}
              dayObject={dayObject}
              showDayLoader={showDayLoader}
              targetDayTId={targetDayTId}
              refresh={refresh}
              showAlert={showAlert}
              forceUpdate={refresh}
            /> */}
          </div>
        )}
      </AppContext.Provider>
    </div>
  );
};

export default App;
