import { v4 as uuidv4 } from 'uuid';

export interface ProductData {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  [key: string]: string | undefined;
}

export interface QualityIssue {
  id: string;
  productId: string;
  productName: string;
  issueType: "vendor_info" | "phone_number" | "watermark" | "other";
  description: string;
  imageUrl?: string;
  resolved: boolean;
}

interface ValidationOptions {
  vendorRegex: string;
  phoneRegex: string;
  customRegexPatterns?: string;
}

// Parse CSV string into array of objects
export function parseCSV(csvString: string): ProductData[] {
  const lines = csvString.split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(header => header.trim());
  
  // Find key field names - allow for different column names
  const idField = headers.find(h => /id/i.test(h)) || 'id';
  const nameField = headers.find(h => /name|title/i.test(h)) || 'name';
  const descField = headers.find(h => /desc|description/i.test(h)) || 'description';
  const imageField = headers.find(h => /image|img|photo|url/i.test(h)) || 'image';

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(val => val.trim());
      const product: ProductData = {
        id: '',
        name: '',
        description: '',
      };

      headers.forEach((header, index) => {
        if (index < values.length) {
          if (header === idField) {
            product.id = values[index];
          } else if (header === nameField) {
            product.name = values[index];
          } else if (header === descField) {
            product.description = values[index];
          } else if (header === imageField) {
            product.imageUrl = values[index];
          } else {
            product[header] = values[index];
          }
        }
      });

      // Generate ID if missing
      if (!product.id) {
        product.id = uuidv4();
      }

      return product;
    });
}

// Validate products for quality issues
export function validateProducts(
  products: ProductData[],
  options: ValidationOptions
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  
  // Create RegExp objects from strings
  const vendorRegex = new RegExp(options.vendorRegex, 'i');
  const phoneRegex = new RegExp(options.phoneRegex, 'i');
  
  // Parse custom regex patterns if provided
  const customPatterns: RegExp[] = [];
  if (options.customRegexPatterns) {
    options.customRegexPatterns.split('\n')
      .filter(pattern => pattern.trim() !== '')
      .forEach(pattern => {
        try {
          customPatterns.push(new RegExp(pattern.trim(), 'i'));
        } catch (error) {
          console.error(`Invalid regex pattern: ${pattern}`);
        }
      });
  }

  // Check each product for issues
  products.forEach(product => {
    // Skip products without descriptions
    if (!product.description) return;
    
    // Check for vendor information
    if (vendorRegex.test(product.description)) {
      issues.push({
        id: uuidv4(),
        productId: product.id,
        productName: product.name,
        issueType: "vendor_info",
        description: `Description contains possible vendor information matching pattern: ${options.vendorRegex}`,
        imageUrl: product.imageUrl,
        resolved: false
      });
    }
    
    // Check for phone numbers
    if (phoneRegex.test(product.description)) {
      const matches = product.description.match(phoneRegex);
      issues.push({
        id: uuidv4(),
        productId: product.id,
        productName: product.name,
        issueType: "phone_number",
        description: `Description contains phone number: ${matches ? matches[0] : 'Unknown format'}`,
        imageUrl: product.imageUrl,
        resolved: false
      });
    }
    
    // Check custom patterns
    customPatterns.forEach((pattern, index) => {
      if (pattern.test(product.description)) {
        issues.push({
          id: uuidv4(),
          productId: product.id,
          productName: product.name,
          issueType: "other",
          description: `Description matches custom pattern #${index + 1}`,
          imageUrl: product.imageUrl,
          resolved: false
        });
      }
    });
  });
  
  return issues;
} 