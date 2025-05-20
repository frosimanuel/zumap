// Local mock data layer for drops

const STORAGE_KEY = 'zumap_drops';

function load() {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    let arr = json ? JSON.parse(json) : [];
    // If no drops, add 3 test drops near Zurich (47.39339, 8.51631)
    if (!arr || arr.length === 0) {
      arr = [
        {
          id: 'test1',
          lat: 47.39339,
          lng: 8.51631,
          type: 'text',
          url: 'Welcome to Zurich! This is a test drop.',
          timestamp: Date.now() - 1000000
        },
        {
          id: 'test2',
          lat: 47.39349,
          lng: 8.51731,
          type: 'image',
          url: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Z%C3%BCrich_-_Grossm%C3%BCnster_IMG_1252_ShiftN.jpg',
          timestamp: Date.now() - 900000
        },
        {
          id: 'test3',
          lat: 47.39359,
          lng: 8.51531,
          type: 'pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          timestamp: Date.now() - 800000
        }
      ];
      save(arr);
    }
    return arr;
  } catch {
    return [];
  }
}

function save(drops) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(drops));
}

export function getAllDrops() {
  return load();
}

export function addDrop(drop) {
  const drops = load();
  if (!drops.find(d => d.id === drop.id)) {
    drops.push(drop);
    save(drops);
  }
}

export function resetDrops() {
  localStorage.removeItem(STORAGE_KEY);
}
