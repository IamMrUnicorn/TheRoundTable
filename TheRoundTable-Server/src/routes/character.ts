import { Router } from 'express';
import { getCharacters, importCharacters } from '../controllers/characterController';

const router = Router();

router.get('/characters/:username', getCharacters);
router.post('/characters/:username/import', importCharacters);

export default router;
