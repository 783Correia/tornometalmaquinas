-- Run this in Supabase SQL Editor to create the stock decrement function
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id BIGINT, p_quantity INT)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(stock_quantity - p_quantity, 0)
  WHERE id = p_product_id AND manage_stock = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
