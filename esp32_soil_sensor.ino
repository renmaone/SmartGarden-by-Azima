// Smart Garden: ESP32 firmware (namuna)
// Capacitive soil moisture sensor -> Wi-Fi -> server (HTTP POST, JSON).
#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "SIZNING_WIFI";
const char* WIFI_PASS = "PAROL";
const char* ENDPOINT  = "https://SIZNING-SERVER/api/readings";

const int SENSOR = 34;               // analog pin
const int DRY = 3200, WET = 1300;    // o'z datchigingizni kalibrlang
const int GREENHOUSE_ID = 1;

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void postReading(int id, int pct) {
  HTTPClient http;
  http.begin(ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.POST("{\"greenhouse\":" + String(id) + ",\"moisture\":" + String(pct) + "}");
  http.end();
}

void loop() {
  int raw = analogRead(SENSOR);
  int pct = constrain(map(raw, DRY, WET, 0, 100), 0, 100);
  postReading(GREENHOUSE_ID, pct);
  delay(60000);                      // har 1 daqiqada
}
