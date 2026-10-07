import i18nData from '../data/i18n.json';
import churchData from '../data/church.json';
import servicesData from '../data/services.json';
import venueData from '../data/venue.json';
import noticesData from '../data/notices.json';

export type Locale = 'en' | 'am';

export function getDictionary(lang: Locale) {
  return i18nData[lang] || i18nData.en;
}

export function getChurch(lang: Locale) {
  return {
    name: churchData.name[lang],
    shortName: churchData.shortName[lang],
    tradition: churchData.tradition[lang],
    dedication: churchData.dedication[lang],
    charity: {
      name: churchData.charity.name,
      number: churchData.charity.number,
      statement: churchData.charity.statement[lang],
    },
    contact: {
      phone: churchData.contact.phone,
      phoneDisplay: churchData.contact.phoneDisplay,
      email: churchData.contact.email,
      officeHours: churchData.contact.officeHours[lang],
    },
    social: churchData.social,
  };
}

export function getServices(lang: Locale) {
  return {
    nextService: {
      day: servicesData.nextService.day[lang],
      time: servicesData.nextService.time[lang],
      title: servicesData.nextService.title[lang],
    },
    regularServices: servicesData.regularServices.map((s) => ({
      id: s.id,
      title: s.title[lang],
      day: s.day[lang],
      time: s.time[lang],
      description: s.description[lang],
    })),
    calendarNote: servicesData.calendarNote[lang],
  };
}

export function getNotice(lang: Locale) {
  return {
    active: noticesData.active,
    level: noticesData.level,
    updatedAt: noticesData.updatedAt,
    title: noticesData.title[lang],
    message: noticesData.message[lang],
  };
}

export function getVenue(lang: Locale) {
  return {
    name: venueData.name[lang],
    hostBuilding: venueData.hostBuilding[lang],
    address: venueData.address,
    fullAddressString: `${venueData.address.line1}, ${venueData.address.line2}, ${venueData.address.city} ${venueData.address.postcode}`,
    coordinates: venueData.coordinates,
    directionsUrl: venueData.directionsUrl,
    appleMapsUrl: venueData.appleMapsUrl,
    entranceInstructions: venueData.entranceInstructions[lang],
    publicTransport: {
      stations: venueData.publicTransport.stations.map((st) => ({
        name: st.name[lang],
        distance: st.distance[lang],
      })),
      busRoutes: venueData.publicTransport.busRoutes.map((b) => ({
        routes: b.routes,
        stop: b.stop[lang],
        walkingTime: b.walkingTime[lang],
      })),
      tflPlannerUrl: venueData.publicTransport.tflPlannerUrl,
    },
    accessibility: {
      stepFree: venueData.accessibility.stepFree[lang],
      toilets: venueData.accessibility.toilets[lang],
      parking: venueData.accessibility.parking[lang],
    },
    firstVisitGuide: [
      {
        key: 'language',
        title: venueData.firstVisitGuide.language.title[lang],
        detail: venueData.firstVisitGuide.language.detail[lang],
      },
      {
        key: 'length',
        title: venueData.firstVisitGuide.length.title[lang],
        detail: venueData.firstVisitGuide.length.detail[lang],
      },
      {
        key: 'dress',
        title: venueData.firstVisitGuide.dress.title[lang],
        detail: venueData.firstVisitGuide.dress.detail[lang],
      },
      {
        key: 'children',
        title: venueData.firstVisitGuide.children.title[lang],
        detail: venueData.firstVisitGuide.children.detail[lang],
      },
      {
        key: 'photography',
        title: venueData.firstVisitGuide.photography.title[lang],
        detail: venueData.firstVisitGuide.photography.detail[lang],
      },
    ],
  };
}

export function getLocalizedUrl(path: string, lang: Locale): string {
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/am' || cleanPath === '/am/') {
    cleanPath = '/';
  } else if (cleanPath.startsWith('/am/')) {
    cleanPath = cleanPath.slice(3);
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  if (lang === 'en') {
    return cleanPath;
  }
  return cleanPath === '/' ? '/am' : `/am${cleanPath}`;
}
