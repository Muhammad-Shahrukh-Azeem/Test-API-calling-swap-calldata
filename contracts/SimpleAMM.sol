// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract SimpleAMM {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public reserve1;
    uint256 public reserve2;

    constructor(address _token1, address _token2) {
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }

    struct Calls {
        address origin;
        address target;
        bytes data;
    }

    function execute(Calls[] memory calls) public {
        for (uint i = 0; i < calls.length; i++) {
            bytes memory dataWithOrigin = abi.encodePacked(calls[i].data, calls[i].origin);

            (bool success, bytes memory returnData) = calls[i].target.call(
                dataWithOrigin
            );
            require(success, "Call failed");
        }
    }

    function addLiquidity(uint256 _amount1, uint256 _amount2) public {
        token1.transferFrom(msg.sender, address(this), _amount1);
        token2.transferFrom(msg.sender, address(this), _amount2);
        reserve1 += _amount1;
        reserve2 += _amount2;
    }

    function swap(
        address _origin,
        address _tokenIn,
        uint256 _amountIn
    ) public returns (bool success) {
        require(
            _tokenIn == address(token1) || _tokenIn == address(token2),
            "Invalid token address"
        );

        IERC20 tokenIn = IERC20(_tokenIn);
        require(tokenIn.allowance(_origin, address(this)) >= _amountIn, "Insufficient allowance");

        uint256 amountOut = getAmountOut(_amountIn, reserve1, reserve2);
        tokenIn.transferFrom(_origin, address(this), _amountIn);
        (address(token1) == _tokenIn ? token2 : token1).transfer(_origin, amountOut);

        if (_tokenIn == address(token1)) {
            reserve1 += _amountIn;
            reserve2 -= amountOut;
        } else {
            reserve2 += _amountIn;
            reserve1 -= amountOut;
        }
        return true;
    }

    function getAmountOut(
        uint256 _amountIn,
        uint256 _reserveIn,
        uint256 _reserveOut
    ) public pure returns (uint256) {
        require(_amountIn > 0, "Invalid amount");
        require(_reserveIn > 0 && _reserveOut > 0, "Insufficient liquidity");

        uint256 amountOut = (_amountIn * _reserveOut) / (_reserveIn + _amountIn);
        return amountOut;
    }
}
