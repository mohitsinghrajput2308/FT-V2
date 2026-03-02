const Card = ({ children, className = '', hover = true, padding = true }) => {
    return (
        <div
            className={`
        bg-white dark:bg-dark-200 rounded-xl shadow-md
        border border-gray-200 dark:border-dark-400
        transition-all duration-300
        ${hover ? 'hover:shadow-xl' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
