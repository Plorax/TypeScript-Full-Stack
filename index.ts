import * as https from 'https';

const convertAnyToString = (value: any): string => {
	if (typeof value === 'string' || value instanceof String) {
		return value as string;
	} else {
		return JSON.stringify(value) as string;
	}
};

const padLeft = (value: string, padChar: string, padLength: number): string => {
	// get the pad character
	padChar = padChar[0] || ' ';

	// add the padChar until the length of value is the desired length or bigger
	while (value.length < padLength) {
		value = padChar + value;
	}

	// return the padded result
	return value;
};

const dateToString = (date: Date, includeDate: boolean = true, includeTime: boolean = true): string => {
	// Using this format to avoid UTC changes, using toISOString() and substringing will potentially cause issues with timezones causing the date to be 1 day behind
	let dateString = includeDate
		? padLeft(date.getFullYear() + '', '0', 4) +
		'-' +
		padLeft(date.getMonth() + 1 + '', '0', 2) +
		'-' +
		padLeft(date.getDate() + '', '0', 2)
		: '';

	if (dateString.length && includeTime) dateString += ' ';

	dateString += includeTime
		? padLeft(date.getHours() + '', '0', 2) +
		':' +
		padLeft(date.getMinutes() + '', '0', 2) +
		':' +
		padLeft(date.getSeconds() + '', '0', 2)
		: '';
	return dateString;
};

const convertToBoolean = (value: string | number | boolean | undefined | null) => {
	const valueNumber = Number(value ?? 0);
	return !!(Number.isNaN(valueNumber) ? (value ?? '').toString().toLowerCase() === 'true' : valueNumber);
};

const httpGet = <T>(url: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    let data: T;

    // albums
    https.get(url, (response) => {
      var statusCode = response.statusCode ?? 200;
      var rawData = "";

      if (statusCode > 299) {
        reject(`HTTP ERROR ${statusCode}`);
        return;
      }

      response.on("data", (chunk) => {
        rawData += chunk;
      });

      response.on("end", () => {
        try {
          data = JSON.parse(rawData);
          resolve(data);
        } catch (e) {
          reject("Albums Error");
        }
      });
    });
  });
};

const index = <T, K extends keyof T>(
  array: T[],
  indexes: K[]
): Map<string | undefined, T[]>[] => {
  // create a map for each index
  const mapsArr: Map<string | undefined, T[]>[] = [];

  // add Map objects to the mapsArr
  for (const i in indexes) {
    mapsArr[i] = new Map<string | undefined, T[]>();
  }

  // loop through the array
  for (const entry of array) {
    // for each index, add to the map at the correct index
    for (const i in indexes) {
      // get the index to use
      const index: K = indexes[i];

      // get the current map to add to
      const currMap: Map<string | undefined, T[]> = mapsArr[i];

      // get the value at that index in the current entry
      const indexValue: string = convertAnyToString(entry[index]);

      // check if need to push or create array
      if (!currMap.has(indexValue)) {
        currMap.set(indexValue, [entry]);
      } else {
        (currMap.get(indexValue) || []).push(entry);
      }
    }
  }

  return mapsArr;
};

// API documentation: https://jsonplaceholder.typicode.com/

interface comment {
  id: number;
  name: string;
}

interface photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

interface album {
  userId: number;
  id: number;
  title: string;
}

async function getPhotos() {
  let photos: photo[] = [];
  let albums: album[] = [];
  let comments: comment[] = [];

  albums = await httpGet("https://jsonplaceholder.typicode.com/users/1/albums");
  photos = await httpGet(
    "https://jsonplaceholder.typicode.com/albums/1/photos"
  );
  comments = await httpGet(
    "https://jsonplaceholder.typicode.com/posts/1/comments"
  );

  console.log(albums);
  console.log(photos);
  console.log(comments);
}

getPhotos().then(() => {
  console.log(`I'm done`);
});