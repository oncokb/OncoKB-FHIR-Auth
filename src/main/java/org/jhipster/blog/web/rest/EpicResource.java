package org.jhipster.blog.web.rest;

import java.util.ArrayList;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

/* This file stores the access token along with the current patient ID. The frontend makes requests to our backend, which makes requests to Epic's APIs using the stored information.
 * The documentation for all Epic APIs can be found here: https://fhir.epic.com/Specifications.
 *
 * The Epic APIs used in this demo are:
 * Patient.Read (R4) - For /patient
 * Observation.Search (Genomics) (R4) and Observation.Read (Genomics) (R4) - For /genomics
 */

@RestController
@RequestMapping("/api")
public class EpicResource {

    EpicInfo epicInfo;

    @GetMapping("/token") //An endpoint to receive the access token (including patient ID and ISS) from Epic.
    public ResponseEntity<Void> setAccessToken(@RequestParam String iss, @RequestParam String accessToken, @RequestParam String patientId) {
        try {
            epicInfo = new EpicInfo(iss, accessToken, patientId);
            return new ResponseEntity<Void>(HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<Void>(HttpStatus.SEE_OTHER);
        }
    }

    @GetMapping("/patient")
    public ResponseEntity<String> getCurrentPatient() {
        try {
            RestTemplate restTemplate = new RestTemplate();

            //Get the current patient using Patient.Read (R4).
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(epicInfo.getAccessToken());
            HttpEntity<Object> request = new HttpEntity<>(headers);
            String uri = epicInfo.getIss() + "/" + "Patient/" + epicInfo.getPatientId();
            HttpEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, request, String.class);

            return new ResponseEntity<>(response.getBody(), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/genomics")
    public ResponseEntity<String> getCurrentPatientGenomicData() {
        try {
            RestTemplate restTemplate = new RestTemplate();

            //Get a reference to all observations for the current patient using Observation.Search (Genomics) (R4).
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(epicInfo.getAccessToken());
            HttpEntity<Object> request = new HttpEntity<>(headers);
            String uri =
                epicInfo.getIss() +
                "/" +
                "Observation?patient=" +
                epicInfo.getPatientId() +
                "&subject=" +
                epicInfo.getPatientId() +
                "&category=genomics";
            HttpEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, request, String.class);

            //Parse the JSON, and get all referenced observations' endpoints.
            JSONObject observations = new JSONObject(response.getBody());
            JSONArray entries = observations.getJSONArray("entry");
            ArrayList<String> observationUrls = new ArrayList<>();
            for (int i = 0; i < entries.length(); i++) {
                JSONObject entry = entries.getJSONObject(i);
                JSONObject link = entry.getJSONArray("link").getJSONObject(0);
                String url = link.getString("url");
                observationUrls.add(url);
            }

            //Make requests using each referenced observation's endpoint, and package the results into an array.
            JSONArray observationsJSON = new JSONArray();
            for (int i = 0; i < observationUrls.size(); i++) {
                HttpEntity<String> observationResponse = restTemplate.exchange(
                    observationUrls.get(i),
                    HttpMethod.GET,
                    request,
                    String.class
                );
                JSONObject observationJSON = new JSONObject(observationResponse.getBody());
                observationsJSON.put(observationJSON);
            }
            return new ResponseEntity<>(observationsJSON.toString(), HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    private class EpicInfo {

        private String iss;

        private String accessToken;

        private String patientId;

        public EpicInfo(String iss, String accessToken, String patientId) {
            this.iss = iss;
            this.accessToken = accessToken;
            this.patientId = patientId;
        }

        public String getIss() {
            return iss;
        }

        public void setIss(String iss) {
            this.iss = iss;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getPatientId() {
            return patientId;
        }

        public void setPatientId(String patientId) {
            this.patientId = patientId;
        }
    }
}
