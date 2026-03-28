// Initializes firestore
import admin from 'firebase-admin';
import { collections } from '../../config';
import { Player, Log } from '../classes';
import { firebaseServiceAccount } from '../../config';
import { appendList, spliceList, updateList, setPlayerList } from '../listCache';

if(admin.apps.length === 0) {
    admin.initializeApp({ credential: admin.credential.cert(firebaseServiceAccount)});
}

const db = admin.firestore();
const { FieldValue } = admin.firestore;

/* Firestore custom querys */

// Player register function
export async function registerPlayer(playerData: Player) {
	// Sets doc reference and convert the data to firestore Map
	const ref = db.collection(collections.users).doc(playerData.id);
	const convertedPlayer = Object.assign({}, playerData);

	await ref.set(convertedPlayer);

	console.log(`Player ${playerData.id} registered successfuly.`);

    // updates cached player list
    appendList(playerData);
}

// Log register function
export async function registerLog(logData: Log, playerId: string) {
	const ref = db.collection(collections.users).doc(playerId).collection('logs');
	const convertedLog = {
		...logData,
		timestamp: FieldValue.serverTimestamp(),
	};

	await ref.add(convertedLog);
	console.log(`Log registered succesfully for player ${playerId}.`);
}

// Load player function
export async function loadPlayer(playerId: string): Promise<Player> {
	const ref = db.collection(collections.users).doc(playerId);

	const querySnapshot = await ref.get();
	const data = querySnapshot.data();

	if (!data) {
		throw new Error('Jogador não encontrado')
	}

	return new Player({ ...(data as Player) });
}

export async function loadPlayers(): Promise<Player[]> {
	const ref = db.collection(collections.users);

	const querySnapshot = await ref.get();
	const data: Player[] = [];

	if (!querySnapshot.empty) {
        for(const doc of querySnapshot.docs) {
            data.push(new Player({ ...(doc.data() as Player) }));
        }
	}

	return data;
}

// Update player function
export async function updatePlayer(playerData: Player) {
	const ref = db.collection(collections.users).doc(playerData.id);

	const data: any = Object.assign({}, playerData);
	delete data.id;

	await ref.update(data);
	console.log(`Player ${playerData.id} updated successfuly`);

    // updates the cached player list
    updateList(playerData);
}

export async function deletePlayer(playerId: string) {
	const ref = db.collection(collections.users).doc(playerId);

	ref.delete();
	console.log(`Player ${playerId} deleted successfully.`);

    // updates the cached player list
    spliceList(playerId);
}