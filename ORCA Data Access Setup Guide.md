# **ORCA Data Access Setup Guide** 

**Purpose:** Get real marine data for the ORCA prototype. All sources below are directly accessible — no email, no manual approval, no waiting. 

# **Dataset 1: Open-Meteo Marine API (Ocean Data)** 

**What it gives you:** Wave height, sea surface temperature, swell, ocean currents. 

**Link:** <u>https://marine-api.open-meteo.com/v1/marine</u> 

**Test in browser:** <u>https://marine-api.open-meteo.com/v1/marine? latitude=17.68&longitude=83.31&hourly=wave_height,sea_surface_temperature</u> 

# **Python:** 

python 

import requests 

r = requests.get("https://marine-api.open-meteo.com/v1/marine", params={ 

"latitude": 17.68, "longitude": 83.31, 

"hourly": "wave_height,sea_surface_temperature" 

# }) 

print(r.json()) 

**Variables:** wave_height, wave_direction, wave_period, swell_wave_height, sea_surface_tem perature, ocean_current_velocity, ocean_current_direction 

**Auth:** None required. Free for non-commercial use. 

# **Dataset 2: Open-Meteo Weather API (Wind & Temperature)** 

**What it gives you:** Wind speed/direction, air temperature, atmospheric data. 

**Link:** <u>https://api.open-meteo.com/v1/forecast</u> 

**Test in browser:** <u>https://api.open-meteo.com/v1/forecast? latitude=17.68&longitude=83.31&hourly=wind_speed_10m</u> 

# **Python:** 

python 

import requests 

- r = requests.get("https://api.open-meteo.com/v1/forecast", params={ 

"latitude": 17.68, "longitude": 83.31, 

- "hourly": "wind_speed_10m,wind_direction_10m" 

}) 

print(r.json()) 

**Auth:** None required. Free for non-commercial use. 

# **Dataset 3: INCOIS PFZ Advisory (Fishing Zones)** 

**What it gives you:** Lat/long coordinates of fish aggregation zones, depth, distance/direction from landing centers. 

**WebGIS Link:** <u>https://iioe-2.incois.gov.in/MarineFisheries/PfzWebGis</u> 

- **Advisory Link:** <u>https://iioe 2.incois.gov.in/MarineFisheries/PfzAdvisory.action</u> 

# **How to use for prototype:** 

1. Open the WebGIS map 

2. Select your demo region (e.g., Ratnagiri, Maharashtra) 

3. Copy 3-5 PFZ coordinates (lat/long) 

4. Hardcode them into your code 

**Coverage:** 586 fish landing centers, 14 sectors (Gujarat, Maharashtra, Goa, Karnataka, Kerala, Tamil Nadu, Andhra Pradesh, Odisha, West Bengal, Lakshadweep, Andaman & Nicobar) 

**Data source:** SST and Chlorophyll from NOAA-AVHRR, Oceansat-II, MODIS Aqua 

**Note:** Not issued during monsoon ban (June-July) or cyclones 

**Auth:** None for manual access. 

# **Dataset 4: INCOIS ERDDAP — Chlorophyll Data** 

**What it gives you:** Chlorophyll concentration from IRS P4 OCM satellite (Indian Ocean). 

**Link:** <u>https://erddap.incois.gov.in/erddap/griddap/IRS_chlorophyll_datasets.html</u> 

**Formats available:** NetCDF, CSV, Parquet, GeoJSON 

# **How to use:** 

1. Open link 

2. Select date range and region 

3. Download or query directly 

**Auth:** None. 

# **Dataset 5: NOAA CoastWatch ERDDAP — SST Buoys** 

**What it gives you:** Monthly sea surface temperature from TAO/TRITON, RAMA (Indian Ocean), and PIRATA buoys. 

**Link:** <u>https://coastwatch.pfeg.noaa.gov/erddap/tabledap/pmelTaoMonSst.html</u> 

**Formats available:** CSV, GeoJSON, NetCDF 

# **How to use:** 

1. Open link 

2. Select Indian Ocean region 

3. Download data 

**Auth:** None. 

# **Dataset 6: India GeoJSON Boundaries (Geofencing)** 

# **Option A: datta07/INDIAN-SHAPEFILES** 

- Link: https://github.com/datta07/INDIAN-SHAPEFILES 

- Coverage: National, State, District, Constituency 

- Format: GeoJSON (WGS84, RFC 7946 compliant) 

# **Option B: yashveeeeeeer/india-geodata** 

- Link: https://github.com/yashveeeeeeer/india-geodata 

- Coverage: Country, States, Districts, Subdistricts, Blocks, Panchayats, Villages 

- Formats: GeoJSON, Shapefile, Parquet, PMTiles 

# **Download command:** 

# bash 

# cd data 

curl -O https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/main/STATES/ states.geojson 

**Auth:** None. Open license. 

