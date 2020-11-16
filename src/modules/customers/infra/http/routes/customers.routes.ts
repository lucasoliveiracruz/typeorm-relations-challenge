import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import CustomersController from '../controller/CustomersController';

const customersRouter = Router();
const customersController = new CustomersController();

customersRouter.post(
  '/',
  celebrate({
    body: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
    },
  }),
  customersController.create,
);

export default customersRouter;
