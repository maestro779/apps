// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ActionStatus } from '@polkadot/react-components/Status/types';
import { ContractInfo } from '@polkadot/types/interfaces';

import React, { useCallback } from 'react';
import keyring from '@polkadot/ui-keyring';
import { ContractPromise } from '@polkadot/api-contract';
import { AddressInfo, AddressMini, Button, Forget } from '@polkadot/react-components';
import { useApi, useCall, useToggle } from '@polkadot/react-hooks';
import { Option } from '@polkadot/types';
import { isUndefined } from '@polkadot/util';

import Messages from '../shared/Messages';
import { useTranslation } from '../translate';

interface Props {
  className?: string;
  contract: ContractPromise;
  onCall: (index?: number) => void;
}

function transformInfo (optInfo: Option<ContractInfo>): ContractInfo | null {
  return optInfo.unwrapOr(null);
}

function Contract ({ className, contract, onCall }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const info = useCall<ContractInfo | null>(api.query.contracts.contractInfoOf, [contract.address], { transform: transformInfo });
  const [isForgetOpen, toggleIsForgetOpen] = useToggle();

  const _onForget = useCallback(
    (): void => {
      const status: Partial<ActionStatus> = {
        account: contract.address,
        action: 'forget'
      };

      try {
        keyring.forgetContract(contract.address.toString());
        status.status = 'success';
        status.message = t<string>('address forgotten');
      } catch (error) {
        status.status = 'error';
        status.message = (error as Error).message;
      }

      toggleIsForgetOpen();
    },
    [contract.address, t, toggleIsForgetOpen]
  );

  return (
    <tr className={className}>
      <td className='address top'>
        {isForgetOpen && (
          <Forget
            address={contract.address.toString()}
            key='modal-forget-contract'
            mode='contract'
            onClose={toggleIsForgetOpen}
            onForget={_onForget}
          />
        )}
        <AddressMini value={contract.address} />
      </td>
      <td className='all top'>
        <Messages
          contract={contract}
          contractAbi={contract.abi}
          isWatching
          onSelect={onCall}
          withMessages
        />
      </td>
      <td className='number'>
        <AddressInfo
          address={contract.address}
          withBalance
          withBalanceToggle
          withExtended={false}
        />
      </td>
      <td className='start together'>
        {!isUndefined(info) && (
          info
            ? info.type
            : t<string>('Not on-chain')
        )}
      </td>
      <td className='button'>
        <Button
          icon='trash'
          onClick={toggleIsForgetOpen}
        />
        {!contract.abi && (
          <Button
            icon='play'
            label={t<string>('exec')}
            onClick={onCall}
          />
        )}
      </td>
    </tr>
  );
}

export default React.memo(Contract);
