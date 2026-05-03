import { useState, useEffect } from "react";

interface UserLocation {
  city: string;
  country: string;
  flag: string;
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        if (d.city && d.country_name) {
          setLocation({
            city: d.city,
            country: d.country_name,
            flag: d.country_code
              ? String.fromCodePoint(...[...d.country_code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
              : "",
          });
        }
      })
      .catch(() => {});
  }, []);

  return location;
}
