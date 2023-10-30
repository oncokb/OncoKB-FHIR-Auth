import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import './App.css';
import React from 'react';
import { CLIENT_ID, REDIRECT_URI } from './constants';
import LoadingIndicator, { LoaderSize } from './components/loadingIndicator';

function Main() {
  //need to use local storage because redirecting to external site
  const tokenUrl = localStorage.getItem('tokenUrl');
  const iss = localStorage.getItem('iss');

  const [patient, setPatient] = useState(null);
  const [genomicData, setGenomicData] = useState(null);
  const [backendResponseStatus, setBackendResponseStatus] = useState(null);

  const url = useLocation();
  const urlParams = new URLSearchParams(url.search);
  const code = urlParams.get('code');

  // Get access token, and send to the backend.
  useEffect(() => {
    async function fetchAccessToken() {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', REDIRECT_URI);
      params.append('code', code);
      params.append('client_id', CLIENT_ID);
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      //Get access token from epic using token URL retrieved from metadata (from <Launch />).
      const epicResponse = await axios.post(tokenUrl, params, config);

      const token = epicResponse.data;

      //Pass ISS and token to backend, so it can use Epic APIs.
      const mskResponse = await axios.get(`/api/token?iss=${iss}&accessToken=${token.access_token}&patientId=${token.patient}`);
      setBackendResponseStatus(mskResponse.status);
    }

    try {
      fetchAccessToken();
    } catch (error) {
      setBackendResponseStatus(error.response.status);
    }
  }, [code]);

  //Have our backend retrieve current patient info from Epic.
  async function handlePatientClick() {
    const response = await axios.get('/api/patient');
    setPatient(response.data);
  }

  //Have our backend retrieve genomic data info about current patient from Epic.
  async function handleGenomicDataClick() {
    try {
      const response = await axios.get('/api/genomics');

      setGenomicData(response.data);
    } catch {
      setGenomicData([]);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        {!backendResponseStatus && <LoadingIndicator text="Fetching Access Token" size={LoaderSize.LARGE} />}
        {backendResponseStatus && backendResponseStatus != 200 && <span>Error fetching access token</span>}
        {backendResponseStatus == 200 && !patient && <button onClick={handlePatientClick}>Get Patient</button>}
        {backendResponseStatus == 200 && !genomicData && <button onClick={handleGenomicDataClick}>Get Genomic Data</button>}
        {patient && (
          <div>
            <p>
              <strong>Patient Id:</strong> {patient.id}
            </p>
            <strong>Name: </strong>
            {patient.name[0].text}
            <br />
            <strong>Birth Date: </strong>
            {patient.birthDate} <br />
            <strong>Gender: </strong>
            {patient.gender} <br />
            <strong>Vital Status: </strong>
            {patient.deceasedBoolean ? 'Dead' : 'Alive'} <br />
          </div>
        )}
        <br />
        {genomicData && (
          <div>
            <p>
              <strong>{`Genomic Observations (${genomicData.length}):`}</strong>
            </p>
            {genomicData.map(data => (
              <>
                <strong>Type: </strong>
                {data.code.text} <br />
              </>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default Main;
