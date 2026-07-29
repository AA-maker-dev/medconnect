import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { chatUpload } from '../middleware/chatUpload';
import * as chatController from '../controllers/chat.controllers';
import { listMessagesQuerySchema } from '../validators/chat.validator';

const router = Router();

router.use(authenticate);

router.get('/rooms', chatController.listChatRooms);
router.get('/rooms/:roomId', chatController.getRoomInfo);
router.get(
  '/rooms/:roomId/messages',
  validate(listMessagesQuerySchema),
  chatController.listMessages
);
router.post(
  '/rooms/:roomId/upload',
  chatUpload.single('file'),
  chatController.uploadChatFile
);
router.delete('/messages/:messageId', chatController.deleteMessage);

export default router;
