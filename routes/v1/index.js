import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

import EntryRouter from './entries';
import MatchRouter from './matches';
import StatisticsRouter from './statistics'
import SummonerRouter from './summoners';

const router = express.Router();

// router.get('/champions', (req, res) => {
//   res.json(championData);
// });
// 
// router.get('/champions/:id', (req, res) => {
//   res.json(championData[req.params.id - 1]);
// });

router.use(cors());

router.use('/entries', EntryRouter);
router.use('/matches', MatchRouter);
router.use('/statistics', StatisticsRouter);
router.use('/summoners', SummonerRouter);

export default router;
