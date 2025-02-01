// Initializes firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, collection, getDoc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { collections } from '../../config';
import { Player, Log } from '../classes';
import { firebaseConfig } from '../../config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* Firestore custom querys */

// Player register function
export async function registerPlayer(playerData: Player) {
	// Sets doc reference and convert the data to firestore Map
	const ref = doc(db, collections.users!, playerData.id);
	const convertedPlayer = Object.assign({}, playerData);

	try {
		await setDoc(ref, convertedPlayer);

		console.log(`Player ${playerData.id} registered successfuly.`);
	} catch (error) {
		console.error(`Error registering player: ${error}`);
	}
}

// Log register function
export async function registerLog(logData: Log, playerId: string) {
	const ref = collection(db, collections.users!, playerId.toString(), 'logs');
	const convertedLog = {
		...logData,
		timestamp: serverTimestamp(),
	};

	try {
		await addDoc(ref, convertedLog);
		console.log(`Log registered succesfully for player ${playerId}.`);
	} catch (error) {
		console.error(`Error registering log: ${error}`);
	}
}

// Load player function
export async function loadPlayer(playerId: string): Promise<Player | undefined> {
	const ref = doc(db, collections.users!, playerId);

	try {
		const querySnapshot = await getDoc(ref);

		const data = querySnapshot.data();

    if (data) {
      return new Player(data.id, data.gold, data.gems, data.characters);
    } else {
      throw new Error('Player not found');
    }
	} catch (error: any) {
		console.error(error.message);
	}
}

// Update player function
export async function updatePlayer(playerData: Player) {
	const ref = doc(db, collections.users!, playerData.id);

	const data: any = Object.assign({}, playerData);
	delete data.id;

	try {
		await updateDoc(ref, data);

		console.log(`Player ${playerData.id} updated successfuly`);
	} catch (error) {
		console.error(`Unable to update player ${playerData.id}: ${error}`);
	}
}

export async function deletePlayer(playerId: string) {
	const ref = doc(db, collections.users!, playerId.toString());

	try {
		await deleteDoc(ref);

		console.log(`Player ${playerId} deleted successfully.`);
	} catch (error) {
		console.error(`Failed to delete player ${playerId}: ${error}`);
	}
}