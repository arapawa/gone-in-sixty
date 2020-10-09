import React, { useState, useEffect } from 'react';
import moment from 'moment';
import _ from 'lodash';
import Airtable from 'airtable';
const base = new Airtable({ apiKey: 'keyCxnlep0bgotSrX' }).base('appHXXoVD1tn9QATh');
import Papa from 'papaparse'; // using Papaparse library for FileReader and parsing to Json

import Header from './header';
import Footer from './footer';

function reducer(state, action) {
  return [...state, ...action];
}

/* globals $ */
function App() {
  // clients csv state
  const [clientsFromCsv, setClientsFromCsv] = useState(null);

  // challenges csv state
  const [challengesFromCsv, setChallengesFromCsv] = useState(null);
  console.log(challengesFromCsv);

  const [clients, dispatch] = React.useReducer(
    reducer,
    [] // initial clients
  );

  // note: why are we using challengesFromCsv and not challenges?
  const [challenges, dispatchChallenges] = React.useReducer(
    reducer,
    [] // initial challenges
  );

  // When app first mounts, fetch clients
  useEffect(() => {

    base('Clients').select().eachPage((records, fetchNextPage) => {
      dispatch(records);

      fetchNextPage();
    }, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

  }, []); // Pass empty array to only run once on mount

  function renderChallenges() {

    return challengesFromCsv.map((challenge) => {
      const employerName = challenge.EmployerName;
      // TODO: get domain from Clients (Most Up to Date)
      // const domain = challenge.client.fields['Domain'];
      const domain = 'https://limeadedemorb.mywellmetrics.com';

      const regexpress = /[\s.?!,;:]*/g;
      return (
        // TODO: change id and key into something more reliable for if there are more than one challenge with the same name
        // maybe row number/id/arrayid?
        <tr id={challenge.ChallengeName.replace(regexpress, '')} key={challenge.ChallengeName}>
          <td className="employer-name">{employerName}</td>
          <td className="domain"><a href={`${domain}/ControlPanel/RoleAdmin/ViewChallenges.aspx?type=employer`} target="_blank">{challenge.ChallengeName}</a></td>
          <td className="status">{status}</td>
          <td>
            <button type="button" className="btn btn-primary" onClick={() => uploadChallenge(challenge)}>Upload</button>
          </td>
        </tr>
      );
    });

  }

  function handleChallengesCsvFiles(e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: function(results) {
        console.log('Challenges:', results.data);
        setClientsFromCsv(results.data.EmployerName);
        setChallengesFromCsv(results.data);
      }
    });
  }

  function sanitize(code) {
    let sanitized = code
      .replace(/\r?\n|\r/g, ' ')     // Strip out carriage returns and newlines
      .replace(/\u2018/g, '\'')      // Left single quote
      .replace(/\u2019/g, '\'')      // Right single quote
      .replace(/\u201C/g, '"')       // Left double quote
      .replace(/\u201D/g, '"')       // Right double quote
      .replace(/\u2026/g, '...')     // Ellipsis
      .replace(/\u2013/g, '&ndash;') // Long dash
      .replace(/\u2014/g, '&mdash;') // Longer dash
      .replace(/\u00A9/g, '&copy;');  // Copyright symbol
    return sanitized;
  }

  // note: should we use papaparse for creating the upload csv?
  function createCSV(challenge) {
    

    let data = [[
      'EmployerName',
      'ChallengeId',
      'ChallengeType',
      'IsWeekly',
      'WinStrategy',
      'Target',
      'Activity',
      'ChallengeName',
      'DisplayPriority',
      'StartDate',
      'EndDate',
      'ShortDescription',
      'MoreInformation',
      'ImageUrl',
      'ShowInProgram',
      'RewardType',
      'Reward',
      'Dimensions',
      'LeaderboardTag',
      'EnableDeviceTracking',
      'AllowSelfReporting',
      'DeviceTrackingUnits',
      'IsTeamChallenge',
      'MinTeamSize',
      'MaxTeamSize',
      'Subgroup',
      'Field1',
      'Field1Value',
      'Field2',
      'Field2Value',
      'Field3',
      'Field3Value',
      'AppearanceInProgram',
      'IntegrationPartnerId',
      'ButtonText',
      'TargetUrl',
      'EventCode',
      'ShowExtendedDescription',
      'ActivityTemplateId',
      'IsFeatured',
      'FeaturedDescription',
      'FeaturedImageUrl',
      'DailySelfReportLimit',
      'DefaultPrivacy'
    ]];

    data.push([
      challenge.EmployerName,
      challenge.ChallengeId,
      challenge.ChallengeType,
      challenge.IsWeekly,
      challenge.WinStrategy,
      challenge.Target,
      challenge.Activity,
      challenge.ChallengeName,
      challenge.DisplayPriority,
      challenge.StartDate,
      challenge.EndDate,
      challenge.ShortDescription,
      challenge.MoreInformation,
      challenge.ImageUrl,
      challenge.ShowInProgram,
      challenge.RewardType,
      challenge.Reward,
      challenge.Dimensions,
      challenge.LeaderboardTag,
      challenge.EnableDeviceTracking,
      challenge.AllowSelfReporting,
      challenge.DeviceTrackingUnits,
      challenge.IsTeamChallenge,
      challenge.MinTeamSize,
      challenge.MaxTeamSize,
      challenge.Subgroup,
      challenge.Field1,
      challenge.Field1Value,
      challenge.Field2,
      challenge.Field2Value,
      challenge.Field3,
      challenge.Field3Value,
      challenge.AppearanceInProgram,
      challenge.IntegrationPartnerId,
      challenge.ButtonText,
      challenge.TargetUrl,
      challenge.EventCode,
      challenge.ShowExtendedDescription,
      challenge.ActivityTemplateId,
      challenge.IsFeatured,
      challenge.FeaturedDescription,
      challenge.FeaturedImageUrl,
      challenge.DailySelfReportLimit,
      challenge.DefaultPrivacy
    ]);

    console.log('data for upload:', data);

    return data;
  }

  function uploadChallenge(challenge) {
    const regexpress = /[\s.?!,;:]*/g;

    // let the user know that an upload is in progress
    $('#' + challenge.ChallengeName.replace(/[\s.?!,;:]*/g, '') + ' .status').html('Uploading...');

    const employerName = challenge.EmployerName;
    // TODO: get psk from Clients (Most up to Date)
    // const psk = challenge.client.fields['Limeade PSK'];
    const psk = 'dbd95a93-07e0-4618-8d6d-182dc7e567ad';

    const csv = createCSV(challenge);
    const url = 'https://calendarbuilder.dev.adurolife.com/limeade-upload/';

    const params = {
      e: employerName,
      psk: psk,
      data: csv.join('\n'),
      type: 'Challenges'
    };

    $.post(url, params).done((response) => {
      // if Limeade punks us with a silent fail
      if (response.includes('error')) {
        $('#' + challenge.ChallengeName.replace(regexpress, '')).addClass('bg-danger text-white');
        $('#' + challenge.ChallengeName.replace(regexpress, '') + ' .status').html('Error. See console log.');
        console.log('response: ', response);
        console.log('Upload failed for challenge ' + challenge.ChallengeName);
      } else {
        $('#' + challenge.ChallengeName.replace(regexpress, '')).addClass('bg-success text-white');
        $('#' + challenge.ChallengeName.replace(regexpress, '') + ' .status').html('Success');
      }
    }).fail((request, status, error) => {
      $('#' + challenge.ChallengeName.replace(regexpress, '')).addClass('bg-danger text-white');
      $('#' + challenge.ChallengeName.replace(regexpress, '') + ' .status').html('Error: ' + request.responseText);
      console.error(request.status);
      console.error(request.responseText);
      console.log('Upload failed for challenge ' + challenge.ChallengeName);
    });

    // commenting out in case we need it
    // const employerName = client.fields['Limeade e='];

    // $('#' + employerName.replace(/\s*/g, '') + ' .status').html('Uploading...');
    // $.ajax({
    //   url: 'https://api.limeade.com/api/admin/activity',
    //   type: 'POST',
    //   dataType: 'json',
    //   data: JSON.stringify(data),
    //   headers: {
    //     Authorization: 'Bearer ' + client.fields['LimeadeAccessToken']
    //   },
    //   contentType: 'application/json; charset=utf-8'
    // }).done((result) => {

    //   // Change row to green on success
    //   $('#' + employerName.replace(/\s*/g, '')).removeClass('bg-danger');
    //   $('#' + employerName.replace(/\s*/g, '')).addClass('bg-success text-white');
    //   $('#' + employerName.replace(/\s*/g, '') + ' .status').html('Success');
    //   $('#' + employerName.replace(/\s*/g, '') + ' .challenge-id').html(`<a href="${client.fields['Domain']}/admin/program-designer/activities/activity/${result.Data.ChallengeId}" target="_blank">${result.Data.ChallengeId}</a>`);


    // }).fail((xhr, request, status, error) => {
    //   $('#' + employerName.replace(/\s*/g, '')).addClass('bg-danger text-white');
    //   $('#' + employerName.replace(/\s*/g, '') + ' .status').html('Failed: ' + request.responseText);
    //   console.error('status: ', request.status);
    //   console.error('request: ', request.responseText);
    //   console.log('Create challenge failed for client ' + client.fields['Limeade e=']);
    // });

  }

  // // for single-client-select
  // function selectClient(e) {
  //   clients.forEach((client) => {
  //     if (client.fields['Limeade e='] === e.target.value) {
  //       setSelectedClient(client);
  //     }
  //   });
  // }

  // // for single-client-select
  // function renderEmployerNames() {
  //   const sortedClients = [...clients];

  //   sortedClients.sort((a, b) => {
  //     const nameA = a.fields['Limeade e='].toLowerCase();
  //     const nameB = b.fields['Limeade e='].toLowerCase();
  //     if (nameA < nameB) {
  //       return -1;
  //     }
  //     if (nameA > nameB) {
  //       return 1;
  //     }
  //     return 0;
  //   });

  //   return sortedClients.map((client) => {
  //     return <option key={client.id}>{client.fields['Limeade e=']}</option>;
  //   });
  // }

  return (
    <div id="app">
      <Header />

      <div className="row mb-1">
        <div className="col text-left">
          <h4>Challenge Content</h4>
          <div className="form-group">
            <label htmlFor="csvChallengesInput">Import from CSV</label>
            <input type="file" id="csvChallengesInput" className="form-control-file" accept="*.csv" onChange={(e) => handleChallengesCsvFiles(e)} />
          </div>
        </div>
      </div>

      <div className="row mb-1">
        <table className="table table-hover table-striped" id="challenges">
          <thead>
            <tr>
              <th scope="col">Limeade e=</th>
              <th scope="col">Challenge Name</th>
              <th scope="col">Status</th>
              <th scope="col">Upload</th>
            </tr>
          </thead>
          <tbody>
            {challengesFromCsv ? renderChallenges() : <tr />}
          </tbody>
        </table>
      </div>

      <Footer />

    </div>
  );
}

export default App;
