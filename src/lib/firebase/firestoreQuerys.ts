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

	await setDoc(ref, convertedPlayer);

	console.log(`Player ${playerData.id} registered successfuly.`);
}

// Log register function
export async function registerLog(logData: Log, playerId: string) {
	const ref = collection(db, collections.users!, playerId.toString(), 'logs');
	const convertedLog = {
		...logData,
		timestamp: serverTimestamp(),
	};

	await addDoc(ref, convertedLog);
	console.log(`Log registered succesfully for player ${playerId}.`);
}

// Load player function
export async function loadPlayer(playerId: string): Promise<Player> {
	const ref = doc(db, collections.users!, playerId);

	const querySnapshot = await getDoc(ref);
	const data = querySnapshot.data();

	if (!data) {
		throw new Error('Jogador não encontrado')
	}

	return new Player({ ...(data as Player) });
}

// Update player function
export async function updatePlayer(playerData: Player) {
	const ref = doc(db, collections.users!, playerData.id);

	const data: any = Object.assign({}, playerData);
	delete data.id;

	await updateDoc(ref, data);
	console.log(`Player ${playerData.id} updated successfuly`);
}

export async function deletePlayer(playerId: string) {
	const ref = doc(db, collections.users!, playerId.toString());

	await deleteDoc(ref);
	console.log(`Player ${playerId} deleted successfully.`);
}