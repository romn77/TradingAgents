import copy
import unittest

import tradingagents.default_config as default_config
import tradingagents.dataflows.config as config_module
import tradingagents.dataflows.interface as interface


class VendorRegistryTests(unittest.TestCase):
    def setUp(self):
        config_module._config = copy.deepcopy(default_config.DEFAULT_CONFIG)

    def test_unsupported_vendor_filtered(self):
        config_module.set_config(
            {
                "market": "cn",
                "market_overrides": {"cn": {"core_stock_apis": "bogus_vendor,akshare"}},
            }
        )

        chain = interface.build_vendor_chain("get_stock_data", "cn")
        self.assertNotIn("bogus_vendor", chain)
        self.assertIn("akshare", chain)

    def test_cn_vendor_selected(self):
        config_module.set_config(
            {
                "market": "auto",
                "market_overrides": {"cn": {"core_stock_apis": "tushare,akshare"}},
            }
        )
        market, _, _ = interface.resolve_market_and_symbol(
            "get_stock_data", ("600519", "2024-01-01", "2024-02-01"), {}
        )
        chain = interface.build_vendor_chain("get_stock_data", market)
        self.assertEqual(chain[0], "tushare")


if __name__ == "__main__":
    unittest.main()
