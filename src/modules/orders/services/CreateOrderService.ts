import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const findCustomer = await this.customersRepository.findById(customer_id);

    if (!findCustomer) {
      throw new AppError('User not found with given id.');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (findProducts.length !== products.length) {
      throw new AppError('Some products were not found.');
    }

    const productWithNoAvailableQuantity = products.filter(product => {
      const filteredProducts = findProducts.filter(
        findProduct => findProduct.id === product.id,
      );

      return filteredProducts[0].quantity < product.quantity;
    });

    if (productWithNoAvailableQuantity.length) {
      throw new AppError(
        `The quantity ${productWithNoAvailableQuantity[0].quantity} is not available for ${productWithNoAvailableQuantity[0].id}`,
      );
    }

    const productsOrder = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: findProducts.filter(p => p.id === product.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: findCustomer,
      products: productsOrder,
    });

    const { order_products } = order;

    const updateProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        findProducts.filter(p => p.id === product.product_id)[0].quantity -
        product.quantity,
    }));

    await this.productsRepository.updateQuantity(updateProductsQuantity);

    return order;
  }
}

export default CreateOrderService;
