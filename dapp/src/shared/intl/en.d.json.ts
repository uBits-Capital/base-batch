// This file is auto-generated by next-intl, do not edit directly.
// See: https://next-intl.dev/docs/workflows/typescript#messages-arguments

declare const messages: {
  "shared": {
    "routes": {
      "/pools": "Pools",
      "/portfolio": "Portfolio"
    },
    "ui": {
      "select": {
        "filter": "Search...",
        "remove": "Remove..."
      },
      "table": {
        "pagination": " Page {currentPage} of {totalPages}",
        "header": {
          "sort": {
            "ascending": "Sort ascending",
            "descending": "Sort descending",
            "clear": "Clear sort"
          }
        },
        "tips": {
          "sorting": "Tip: click underlined columns to sort them.",
          "multiple_sorting": "Tip: hold shift to sort multiple columns."
        },
        "no_rows": "No results found..."
      },
      "token-input": {
        "balance": "Balance:"
      }
    },
    "schema": {
      "number": {
        "integer": "{path} must be an integer",
        "min": "{path} must be greater than or equal to {min, plural}",
        "max": "{path} must be less than or equal to {max, plural}"
      },
      "string": {
        "min": "{path} must be at least {min, plural, =1 {one character} other {# characters}}",
        "max": "{path} must be at most {max, plural, =1 {one character} other {# characters}}"
      },
      "default": "{path} is invalid",
      "required": "{path} is a required field",
      "defined": "{path} must be defined",
      "notType": "{path} must be a {type}"
    }
  },
  "widgets": {
    "navbar": {
      "wrong_network": "Invalid network, try switching to {network}",
      "switched_network": "Connected on {network}",
      "signin_error": "Error connecting wallet. Please try again.",
      "connect": "Connect"
    },
    "party-positions": {
      "ui": {
        "positions-table": {
          "desktop": {
            "columns": {
              "name": "Pool Name",
              "pool": "Pool",
              "tvl": "TVL",
              "fees_apr": "Estimated Fee APR",
              "performance_fee": "Performance Fee",
              "investors": "Investors",
              "strategy": "Strategy"
            },
            "not_connected": "Connect your wallet to visualize this pool"
          },
          "mobile": {
            "columns": {
              "name": "Parties",
              "tvl": "TVL"
            },
            "expanded": {
              "performance_fee": "Performance Fee",
              "investors": "Investors",
              "age": "Age",
              "uniswap_tvl": "Uniswap TVL",
              "strategy": "Strategy"
            }
          }
        },
        "add-liquidity-drawer": {
          "title": "Add Liquidity",
          "position": "Position",
          "current_tvl": "Current TVL",
          "performance_fee": "Performance Fee",
          "amount_label": "Amount (USD)",
          "amount_placeholder": "0.00",
          "strategy": "Strategy",
          "cancel": "Cancel",
          "add_liquidity": "Add Liquidity",
          "adding": "Adding..."
        }
      }
    },
    "party-portfolio": {
      "auth": {
        "not_connected_error": "Connect your wallet to see your positions.",
        "unauthorized_error": "You are not authorized to view this portfolio."
      },
      "ui": {
        "portfolio_error": "An error occurred while fetching the portfolio. Please try again."
      }
    },
    "portfolio-positions": {
      "ui": {
        "balance-summary": {
          "total_balance": "Total Balance",
          "total_fees": "Total fees",
          "hide_exited_positions": "Hide Exited Positions",
          "show_exited_positions": "Show Exited Positions"
        },
        "positions-table": {
          "my_positions": "My positions",
          "no_results": "No results",
          "connect_wallet": "Connect your wallet to check your Portfolio",
          "error_message": "Sorry something went wrong.",
          "retry_link": "Please retry again."
        },
        "table-row": {
          "exited_position": "Exited Position",
          "closed_position": "Closed Position",
          "performance_fee": "Performance fee",
          "your_balance": "Your Balance",
          "pool_position_balance": "Pool Position Balance",
          "your_claimable_fees": "Your Claimable fees"
        },
        "position-details-panel": {
          "missing_data_error": "Missing required data to collect fees",
          "collect_fees_error": "Failed to execute fees collection transaction",
          "back": "Back",
          "increase_position": "Increase Position",
          "increase_position_coming_soon": "Increase position functionality coming soon..."
        },
        "main-info": {
          "position_not_found": "Position not found",
          "your_claimable_fees": "Your Claimable fees",
          "usdc_rewards": "USDC Rewards",
          "rewards": "Rewards",
          "collect_all_as_usdc": "Collect all as USDC",
          "collect_as_token_pair": "Collect as token pair",
          "collect_fees": "Collect fees",
          "your_position_in_pool": "Your position in this pool",
          "increase": "Increase",
          "remove": "Remove",
          "close-pool": "Close",
          "close": "Close Pool",
          "collect_fees_dialog_title": "Collect Fees",
          "collect": "Collect",
          "confirming": "Confirming...",
          "transaction_status": "Transaction Status",
          "transaction_hash": "Transaction Hash:",
          "transaction_status_label": "Transaction Status:",
          "waiting_confirmation": "⏳ Waiting for confirmation...",
          "transaction_confirmed": "✅ Transaction confirmed!",
          "transaction_cancelled": "Transaction was cancelled. Please try again.",
          "confirm_in_wallet": "Please confirm the transaction in your wallet...",
          "calculating_route": "Calculating best route to collect fees..."
        },
        "remove-liquidity": {
          "remove_liquidity": "Remove liquidity",
          "position_closed_warning": "Your Position will be closed. If you want to keep your position, please remove less than 51%.",
          "minimum_liquidity_warning": "The minimum liquidity to maintain a position is $5. If you proceed, your remaining liquidity will be below this threshold, and your entire position will be removed and transferred back to your wallet.",
          "max": "Max",
          "all_fees_collected": "All fees earned ({totalRewards}) will be collected.",
          "collect_as_token_pair": "Collect as token pair",
          "collect_all_as_usdc": "Collect all as USDC",
          "gas_costs": "Gas costs",
          "max_slippage": "Max. Slippage",
          "new_position_amount": "Your new position in this pool",
          "remove_preview": "Remove (preview)",
          "confirm_remove_liquidity": "Confirm Remove Liquidity",
          "amount_to_remove": "Amount to remove:",
          "collection_method": "Collection method:",
          "as_usdc": "As USDC",
          "as_token_pair": "As token pair",
          "fees_collected": "Fees collected:",
          "confirm": "Confirm",
          "processing": "Processing...",
          "close_pool": "Close Pool"
        },
        "add-liquidity": {
          "add_liquidity": "Add liquidity",
          "max": "Max",
          "gas_costs": "Gas costs",
          "max_slippage": "Max. Slippage",
          "new_position_amount": "Your new position in this pool",
          "add_preview": "Add Liquidity (preview)",
          "confirm_add_liquidity": "Confirm Add Liquidity",
          "amount_to_add": "Amount to add:",
          "confirm": "Confirm",
          "processing": "Processing..."
        },
        "close-position": {
          "close-pool-button": "Close",
          "modal": {
            "title": "Close Pool",
            "warning": {
              "title": "You are about to close your position!",
              "subtitle": "When you proceed, all of yours and investors' funds will be removed, as well as all collected fees, and will be available for each one to claim."
            },
            "close-button": "Close Pool"
          },
          "confirmation-modal": {
            "title": "Close Pool",
            "how-to-close": {
              "title": "How would you like to collect investor funds?",
              "subtitle": "Note that the liquidity, collected fees, and the creator's performance fee will still be collected in the token pair."
            },
            "close-as-token-pair-button": "Collect as {currency0} and {currency1}",
            "close-as-usdc-button": "Collect as USDC"
          }
        },
        "whithdraw": {
          "withdraw-button": "Withdraw",
          "title": "The position you were providing liquidity for has been closed. Click Withdraw to receive your collected fees and funds.",
          "subtitle": "The position you were providing liquidity for has been closed.",
          "claimable-fees": "Your Claimable fees",
          "total-in-postision": "Your position in this pool",
          "collect-in-stable": "Collect all as USDC",
          "collect-in-token-pair": "Collect as token pair"
        },
        "move-range": {
          "per": "per",
          "move-range-preview-button": "Move Range Preview",
          "modal": {
            "title": "Move Range",
            "subtitle": "You're about to change the position range!",
            "description": "All liquidity (from all participants in this pool) will be moved to the new range. Check out the estimated information below.",
            "move-range-fee": "Move Range Fee: 0.001 ETH",
            "new-range": "New Range",
            "move-range-button": "Move Range"
          }
        }
      }
    },
    "pick-a-pool": {
      "ui": {
        "new_pool_button": "New Pool",
        "must_be_connected": "Connect your wallet to create new pools",
        "dialog": {
          "title": "Find a pool (Uniswap V3)",
          "subtitle": "Top 100 Pools by TVL",
          "columns": {
            "pool": "Pool",
            "tvlInUSD": "TVL",
            "dailyAPR": "1 day APR",
            "volumeUSD": "Volume (24h)"
          }
        }
      }
    },
    "create-pool": {
      "ui": {
        "title-bar": {
          "change": "Change"
        },
        "price-range": {
          "header": {
            "title": "Price Range",
            "toggle": {
              "price": "Price range visible?",
              "in-out": "In/out of range visible?"
            }
          },
          "toggle-buttons": {
            "full-range": "Full range"
          },
          "inout-range": {
            "in": "In range",
            "out": "Out of range"
          },
          "tickers": {
            "low_price": "Low price",
            "high_price": "High price",
            "current_price": "Current price",
            "per": "per"
          }
        },
        "deposits-amount": {
          "header": {
            "title": "Deposits Amount",
            "toggle": {
              "token-pair": "Token pair visible?"
            }
          },
          "inputs": {
            "errors": {
              "insufficient-balance": "Insufficient balance"
            }
          }
        },
        "feature-settings": {
          "header": {
            "title": "Pool feature settings"
          },
          "inputs": {
            "performance-fee": {
              "title": "Performance fee",
              "description": "Add the performance fee that will be charged on top of the collected fees (10% - 90%)"
            },
            "pool-name": {
              "title": "Pool Name",
              "description": "Name your pool",
              "placeholder": "Enter pool name"
            },
            "strategy": {
              "title": "Strategy Description",
              "description": "Describe your pool strategy",
              "placeholder": "Enter pool strategy"
            }
          }
        },
        "submit": {
          "header": {
            "title": "Submit"
          },
          "slippage": {
            "name": "Max. slippage",
            "auto": "Auto",
            "custom": "Custom",
            "warning": "Keep in mind that high slippage values might cause your\n transaction to be frontrun and result in an unfavorable trade"
          },
          "depositCost": "Total deposit cost",
          "button": "Submit"
        },
        "scroll-down": {
          "description": "Scroll down for more"
        }
      },
      "schema": {
        "isPriceRangeVisible": "Price Range",
        "isInoutRangeVisible": "In/out Range",
        "isFullRange": "Full Range",
        "isTokenPairVisible": "Token Pair",
        "depositAmount0": "Deposit Amount",
        "depositAmount1": "Deposit Amount",
        "lowerPrice": "Low Price",
        "upperPrice": "High Price",
        "baseTokenId": "Base Token",
        "performanceFee": "Performance fee",
        "name": "Pool Name",
        "strategy": "Strategy Description",
        "slippage": "Max. slippage",
        "totalFiatDepositAmount": "Deposit amount",
        "validation": {
          "min": "{field} must be at least {min, number}",
          "max": "{field} must be less than or equal to {max, number}"
        }
      },
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "accept-button": "Create Pool",
          "close": "Close"
        },
        "pending": {
          "description": "Add {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "See my portfolio"
        },
        "success": {
          "description": "Add {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "See my portfolio"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Create Pool with slippage"
        }
      }
    },
    "collect-fees": {
      "ui": {
        "action": "Collect Fees"
      },
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "est-min-amount": "Est. Min. Amount",
          "accept-button": "Collect Fees",
          "close": "Close"
        },
        "pending": {
          "as-usdc": "Collecting Fees ${amount}",
          "as-token-pair": "Collecting Fees {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "success": {
          "as-usdc": "Collected Fees ${amount}",
          "as-token-pair": "Collected Fees {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Collect Fees with slippage"
        }
      }
    },
    "remove-liquidity": {
      "ui": {
        "action": "Remove"
      },
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "est-min-amount": "Est. Min. Amount",
          "accept-button": "Remove",
          "close": "Close"
        },
        "pending": {
          "as-usdc": "Removing ${amount}",
          "as-token-pair": "Removing {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "success": {
          "as-usdc": "Removed ${amount}",
          "as-token-pair": "Removed {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Remove with slippage"
        }
      }
    },
    "add-liquidity": {
      "ui": {
        "action": "Add"
      },
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "est-min-amount": "Est. Min. Amount",
          "accept-button": "Add Liquidity",
          "close": "Close"
        },
        "pending": {
          "as-usdc": "Adding ${amount}",
          "as-token-pair": "Adding {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "success": {
          "as-usdc": "Added ${amount}",
          "as-token-pair": "Added {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Portfolio"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Add with slippage"
        }
      }
    },

    "close-position": {
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "accept-button": "Close Pool",
          "close": "Close"
        },
        "pending": {
          "as-token-pair": "Closing Pool {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "success": {
          "as-token-pair": "Closed {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Close Pool with slippage"
        }
      }
    },

    "withdraw": {
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "est-min-amount": "Est. Min. Amount",
          "accept-button": "Withdraw",
          "close": "Close"
        },
        "pending": {
          "as-usdc": "Withdrawing ${amount}",
          "as-token-pair": "Withdrawing {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "success": {
          "as-usdc": "Withdrawn ${amount}",
          "as-token-pair": "Withdrawn {baseAmount} {baseToken} and {quoteAmount} {quoteToken}",
          "close": "Close"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Withdraw with slippage"
        }
      }
    },

    "move-range": {
      "transaction": {
        "pending-build-tx": {
          "description": "Building transaction...",
          "close": "Close"
        },
        "build-tx": {
          "accept-button": "Move Range",
          "close": "Close"
        },
        "pending": {
          "label": "Moving Range...",
          "close": "Close"
        },
        "success": {
          "label": "Moved Range Successfully",
          "close": "Close"
        },
        "error": {
          "description": "Try again later.",
          "close": "Close",
          "accept-slippage-button": "Move Range with slippage"
        }
      }
    }
  },
  "pages": {
    "pools": {
      "title": "Pools"
    },
    "creator": {
      "title": "Create a pool"
    },
    "portfolio": {
      "title": "Portfolio",
      "not_connected": "Connect your wallet to see your portfolio"
    }
  },
  "features": {
    "pool-filter": {
      "ui": {
        "token0": {
          "placeholder": "Select a token..."
        },
        "token1": {
          "placeholder": "Select a token..."
        },
        "search": {
          "placeholder": "Search by creator, pool name, strategy, pool address or token"
        }
      }
    },
    "transaction-modal": {
      "ui": {
        "pending": {
          "title": "Transaction pending"
        },
        "build-tx": {
          "title": "Transaction pending",
          "max-slippage": "Max. Slippage",
          "protocol-fee": "Protocol Fee",
          "price-impact": "Price Impact",
          "min-amount-in": "Est. Min. Amount in",
          "estimated-gas": "Estimated Gas"
        },
        "success": {
          "title": "Success",
          "view-in-explorer": "View in Explorer"
        },
        "error": {
          "title": "Something went wrong.",
          "copied": {
            "success": "Error details copied to clipboard",
            "error": "Failed to copy error details into the clipboard"
          }
        },
        "slippage": {
          "title": "Slippage exceeds your limit of {slippage}%.",
          "subtitle": "Adjust slippage or try again later.",
          "warning": {
            "high": "This may result in an unfavorable trade. Try lowering your slippage setting.",
            "low": "Slippage below 0.05% may result in a failed transaction."
          },
          "close": "Close"
        }
      }
    }
  },
  "entities": {
    "tokens": {
      "ui": {
        "fee": "fee tier",
        "select": "select",
        "to": "To",
        "pool": "Pool"
      }
    }
  },
  "remove-liquidity": {
    "remove_liquidity": "Remove liquidity",
    "position_closed_warning": "Your Position will be closed. If you want to keep your position, please remove less than 51%.",
    "minimum_liquidity_warning": "The minimum liquidity to maintain a position is $5. If you proceed, your remaining liquidity will be below this threshold, and your entire position will be removed and transferred back to your wallet.",
    "max": "Max",
    "all_fees_collected": "All fees earned ({totalRewards}) will be collected.",
    "collect_as_token_pair": "Collect as token pair",
    "collect_all_as_usdc": "Collect all as USDC",
    "gas_costs": "Gas costs",
    "max_slippage": "Max. Slippage",
    "new_position_amount": "Your new position in this pool",
    "remove_preview": "Remove (preview)",
    "confirm_remove_liquidity": "Confirm Remove Liquidity",
    "amount_to_remove": "Amount to remove:",
    "collection_method": "Collection method:",
    "as_usdc": "As USDC",
    "as_token_pair": "As token pair",
    "fees_collected": "Fees collected:",
    "confirm": "Confirm",
    "processing": "Processing..."
  },
  "add-liquidity": {
    "add_liquidity": "Add liquidity",
    "max": "Max",
    "gas_costs": "Gas costs",
    "max_slippage": "Max. Slippage",
    "new_position_amount": "Your new position in this pool",
    "add_preview": "Add Liquidity (preview)",
    "confirm_add_liquidity": "Confirm Add Liquidity",
    "amount_to_add": "Amount to add:",
    "confirm": "Confirm",
    "processing": "Processing..."
  }
};
export default messages;