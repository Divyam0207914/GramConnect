// Indian administrative divisions - Sample data for testing
// In production, this should be fetched from a comprehensive database

export const locationData = {
  "Karnataka": {
    "Bangalore Urban": {
      blocks: ["Yelahanka", "Bommanahalli", "Dasarahalli", "Mahadevapura", "Rajarajeshwari Nagar", "Byatarayanapura", "Anekal", "K.R. Puram"]
    },
    "Bangalore Rural": {
      blocks: ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"]
    },
    "Mysore": {
      blocks: ["Mysore North", "Mysore South", "K.R. Nagar", "Hunsur", "Periyapatna", "T. Narasipura"]
    }
  },
  "Maharashtra": {
    "Mumbai": {
      blocks: ["Kurla", "Andheri", "Borivali", "Bandra", "Dadar", "Mulund", "Powai"]
    },
    "Pune": {
      blocks: ["Haveli", "Mulshi", "Maval", "Bhor", "Velhe", "Purandar", "Baramati"]
    },
    "Thane": {
      blocks: ["Thane City", "Kalyan", "Ulhasnagar", "Ambernath", "Badlapur"]
    }
  },
  "Tamil Nadu": {
    "Chennai": {
      blocks: ["Perambur-Purasawalkam", "Mambalam-Guindy", "Adyar-Velachery", "Ambattur", "Madhavaram", "Sholinganallur", "Alandur"]
    },
    "Coimbatore": {
      blocks: ["Coimbatore North", "Coimbatore South", "Pollachi", "Valparai", "Anamalai"]
    }
  },
  "Delhi": {
    "Central Delhi": {
      blocks: ["Connaught Place", "Karol Bagh", "Chandni Chowk", "Darya Ganj"]
    },
    "South Delhi": {
      blocks: ["Hauz Khas", "Saket", "Vasant Vihar", "Defence Colony", "Greater Kailash"]
    },
    "North Delhi": {
      blocks: ["Civil Lines", "Model Town", "Keshav Puram", "Narela"]
    }
  },
  "West Bengal": {
    "Kolkata": {
      blocks: ["Kolkata North", "Kolkata South", "Kolkata East", "Kolkata West", "Jadavpur"]
    },
    "Howrah": {
      blocks: ["Howrah", "Bally Jagachha", "Uluberia", "Shyampur", "Domjur"]
    }
  }
};

// Helper functions
export const getStates = () => {
  return Object.keys(locationData);
};

export const getDistricts = (state) => {
  if (!state || !locationData[state]) return [];
  return Object.keys(locationData[state]);
};

export const getBlocks = (state, district) => {
  if (!state || !district || !locationData[state] || !locationData[state][district]) return [];
  return locationData[state][district].blocks;
};

export default locationData;
