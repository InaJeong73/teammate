const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

const { admin, db } = require('../config/firebaseConfig');

const signUp = async (req, res) => {
    const { email, password, major, grade, region } = req.body;

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        const uid = userRecord.uid;
        await db.collection('users').doc(uid).set({
            email,
            uid,
            major,
            grade,
            region,
        });

        await db.collection('usersByMajor').doc(uid).set({
            uid,
            email,
            major,
            grade,
            region,
        });

        await db.collection('usersByGrade').doc(uid).set({
            uid,
            email,
            major,
            grade,
            region,
        });

        await db.collection('usersByRegion').doc(uid).set({
            uid,
            email,
            major,
            grade,
            region,
        });

        res.status(201).json({ message: "회원가입 성공" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            res.status(200).json({ message: "로그인 성공" });
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
};

const createProfile = async (req, res) => {
    const { uid, name, birth, phoneNumber, university, experience, major, grade, region } = req.body;

    try {
        await db.collection('users').doc(uid).update({
            uid,
            name,
            birth,
            phoneNumber,
            university,
            experience,
            major,
            grade,
            region,
        });

        res.status(200).json({ message: "프로필 생성 완료" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editProfile = async (req, res) => {
    const { uid, name, birth, phoneNumber, university, experience, major, grade, region } = req.body;

    try {
        await db.collection('users').doc(uid).update({
            name,
            birth,
            phoneNumber,
            university,
            experience,
            major,
            grade,
            region,
        });

        res.status(200).json({ message: "프로필 편집 완료" });
    } catch (error) {
        console.error(`Error editing profile: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};


const getProfile = async (req, res) => {
    const { uid } = req.params;

    try {
        const doc = await db.collection('users').doc(uid).get();

        if (!doc.exists) {
            res.status(404).json({ error: "프로필을 찾을 수 없습니다." });
            return;
        }

        const profileData = doc.data();
        res.status(200).json(profileData);
    } catch (error) {
        console.error(`Error getting profile: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

const getProfileByCategory = async (req, res) => {
    const { category, value } = req.params;

    try {
        const querySnapshot = await db.collection(`usersBy${category}`).where(category, '==', value).get();

        const profiles = [];
        querySnapshot.forEach((doc) => {
            profiles.push(doc.data());
        });

        res.status(200).json(profiles);
    } catch (error) {
        console.error(`Error getting profiles: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    signUp,
    login,
    createProfile,
    editProfile,
    getProfile,
    getProfileByCategory
};