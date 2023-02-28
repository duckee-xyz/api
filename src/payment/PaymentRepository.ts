import { cloneDeep } from 'lodash';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from '~/utils';
import { User } from '../user';
import { PaymentLogEntity, StripeCustomer } from './entities';
import { PaymentLog } from './models';

@Service()
export class PaymentRepository {
  constructor(
    @InjectRepository(PaymentLogEntity) private paymentLogRepo: Repository<PaymentLogEntity>,
    @InjectRepository(StripeCustomer) private stripeCustomerRepo: Repository<StripeCustomer>,
  ) {}

  async getStripeCustomerId(user: User): Promise<string | undefined> {
    const customer = await this.stripeCustomerRepo.findOneBy({ user: { id: user.id } });
    return customer?.stripeCustomerId;
  }

  async setStripeCustomerId(user: User, customerId: string) {
    await this.stripeCustomerRepo.upsert(
      {
        user: { id: user.id },
        stripeCustomerId: customerId,
      },
      ['user'],
    );
  }

  async createPaymentLog(data: Partial<PaymentLog>): Promise<PaymentLog> {
    const entity = await this.paymentLogRepo.save(cloneDeep(data));
    return Object.assign(new PaymentLogEntity(), entity).toModel();
  }

  async getPaymentLogBy(paymentIntentId: string): Promise<PaymentLog | undefined> {
    const entity = await this.paymentLogRepo.findOne({ where: { paymentIntentId } });
    return entity?.toModel();
  }

  async updatePaymentLog(paymentIntentId: string, values: Partial<PaymentLog>) {
    await this.paymentLogRepo.update({ paymentIntentId }, values);
  }

  async getPaymentOf(address: string, artTokenId: number): Promise<PaymentLog | undefined> {
    const entity = await this.paymentLogRepo.findOne({ where: { address, artTokenId, status: 'succeed' } });
    return entity?.toModel();
  }
}
