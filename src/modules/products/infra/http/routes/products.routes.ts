import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';

import ProductsController from '../controller/ProductsController';

const productsRouter = Router();
const productsController = new ProductsController();

productsRouter.post(
  '/',
  celebrate({
    body: {
      name: Joi.string().required(),
      price: Joi.number().required(),
      quantity: Joi.number().integer().required(),
    },
  }),
  productsController.create,
);

export default productsRouter;
